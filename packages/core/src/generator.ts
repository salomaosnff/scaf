import { rm, stat } from "node:fs/promises";
import { join, relative } from "node:path";

import { input, select } from "@inquirer/prompts";
import type { ScaffoldContext } from "@create-scaf/template";
import { getPackageManager } from "./package_manager";
import { render } from "./render";
import { getTemplate } from "./template";

/**
 * Opções de configuração para execução do processo de scaffolding.
 */
export interface RunTemplateOptions {
    /** Nome do repositório remoto ou caminho do template local. */
    template?: string;
    /** Pasta de destino do novo projeto. */
    folder?: string;
    /** Nome do gerenciador de pacotes desejado (npm, pnpm, yarn). */
    packageManager?: string;
    /** Sobreescreve o diretório de destino caso ele já exista. */
    override?: boolean;
    /** Argumentos de linha de comando repassados para o template. */
    args?: Record<string, any>;
}

/**
 * Cria o proxy utilitário para a resolução lazy de prompts e argumentos de linha de comando.
 */
export function createPromptsProxy(
    templatePrompts: Record<string, any> = {},
    cliArgs: Record<string, any> = {}
) {
    return new Proxy({}, {
        get(_target, prop: string) {
            return async (fallback?: any) => {
                if (prop in cliArgs && cliArgs[prop] !== undefined) {
                    return cliArgs[prop];
                }

                const promptDef = templatePrompts[prop];

                if (fallback !== undefined) {
                    if (typeof fallback === 'function') {
                        return await fallback();
                    }
                    return fallback;
                }

                if (promptDef) {
                    if (typeof promptDef === 'object' && promptDef !== null) {
                        if (typeof promptDef.prompt === 'function') {
                            return await promptDef.prompt();
                        }
                        if ('default' in promptDef) {
                            return promptDef.default;
                        }
                    } else if (typeof promptDef === 'function') {
                        return await promptDef();
                    }
                }

                return undefined;
            };
        }
    });
}

/**
 * Alias para as opções de execução do scaffolding.
 */
export type ScaffoldOptions = RunTemplateOptions;

/**
 * Executa o fluxo completo de geração de projetos (scaffolding).
 * 
 * 1. Coleta dados de template e pasta caso não informados.
 * 2. Resolve e carrega a definição do template (local ou git).
 * 3. Prepara o contexto e executa os ganchos do template: banner, config, render, install e finish.
 * 
 * @param targetTemplate - Nome/caminho do template ou objeto de opções `ScaffoldOptions`.
 * @param context - Contexto opcional predefinido.
 * @param cliOptions - Opções adicionais de CLI.
 */
export async function scaffold<Context extends ScaffoldContext = ScaffoldContext>(
    targetTemplate?: string | RunTemplateOptions,
    context?: Context,
    cliOptions?: RunTemplateOptions
) {
    let opts: RunTemplateOptions = {};

    if (typeof targetTemplate === 'object' && targetTemplate !== null) {
        opts = targetTemplate;
    } else {
        opts = { template: typeof targetTemplate === 'string' ? targetTemplate : undefined, ...cliOptions };
    }

    let templateFolder = opts.template;
    if (!templateFolder) {
        templateFolder = await input({ required: true, message: 'Digite o template a ser utilizado' });
    }

    let folder = opts.folder;
    if (!folder) {
        folder = await input({ required: true, message: 'Digite o nome do diretório' });
    }

    const baseCwd = process.env.INIT_CWD || process.cwd();
    folder = join(baseCwd, folder);

    const folderExists = await stat(folder).then(() => true).catch(() => false);
    if (folderExists) {
        if (opts.override) {
            await rm(folder, { recursive: true, force: true });
        } else {
            const action = await select({
                message: `O diretório "${folder}" já existe. O que deseja fazer?`,
                choices: [
                    { name: 'Excluir', value: 'delete' },
                    { name: 'Sobreescrever', value: 'overwrite' },
                    { name: 'Cancelar', value: 'cancel' }
                ]
            });

            if (action === 'cancel') {
                console.log('Operação cancelada.');
                return;
            }

            if (action === 'delete') {
                await rm(folder, { recursive: true, force: true });
            }
        }
    }

    const template = await getTemplate(templateFolder);
    const packageManager = await getPackageManager(folder, opts.packageManager);

    const defaultContext: ScaffoldContext = {
        folder,
        templateFolder: template.folder,
        renderFolder: join(template.folder, 'template'),
        dependencies: [],
        devDependencies: []
    };

    const ctx = (context ?? defaultContext) as Context;

    if (typeof template.banner === 'function') {
        const res = await template.banner({ context: ctx, template });
        if (typeof res === 'string') {
            console.log(res);
        }
    } else if (typeof template.banner === 'string') {
        console.log(template.banner);
    } else if (template.name) {
        console.log(`\n🚀 ${template.name}\n`);
    }

    const templatePrompts = template.prompts ?? template.args;
    const promptsProxy = createPromptsProxy(templatePrompts, opts.args);

    const configContext = new Proxy(ctx, {
        get(target, prop, receiver) {
            if (prop === 'context') return ctx;
            if (prop === 'prompts') return promptsProxy;
            if (prop === 'args') return promptsProxy;
            return Reflect.get(target, prop, receiver);
        }
    });

    const configResult = await template.config?.(configContext as any);
    if (configResult && typeof configResult === 'object') {
        Object.assign(ctx, configResult);
    }

    if (template.render) {
        await template.render({
            context: ctx,
            render(input, output) {
                return render(ctx, input, output);
            }
        });
    } else {
        await render(ctx, "**/*");
    }

    async function install() {
        if (ctx.dependencies.length > 0) {
            const { promise, resolve, reject } = Promise.withResolvers<void>();
            packageManager.add(ctx.dependencies).addListener('error', reject).addListener('close', (code) => {
                if (code === 0) resolve(); else reject(new Error(`Falha ao instalar dependências (código ${code})`));
            });
            await promise;
        }
        if (ctx.devDependencies.length > 0) {
            const { promise, resolve, reject } = Promise.withResolvers<void>();
            packageManager.addDev(ctx.devDependencies).addListener('error', reject).addListener('close', (code) => {
                if (code === 0) resolve(); else reject(new Error(`Falha ao instalar devDependencies (código ${code})`));
            });
            await promise;
        }
        if (ctx.dependencies.length === 0 && ctx.devDependencies.length === 0) {
            const { promise, resolve, reject } = Promise.withResolvers<void>();
            packageManager.install().addListener('error', reject).addListener('close', (code) => {
                if (code === 0) resolve(); else reject(new Error(`Falha ao instalar dependências (código ${code})`));
            });
            await promise;
        }
    }

    if (template.install) {
        await template.install?.({
            context: ctx,
            packageManager,
            install
        })
    } else {
        await install()
    }

    function finish() {
        const relativeFolder = relative(baseCwd, ctx.folder);
        const createdFiles = (ctx.createdFiles as string[] | undefined) ?? [];

        if (createdFiles.length > 0) {
            console.log(`\n📁 Arquivos gerados (${createdFiles.length}):\n`);
            for (const file of createdFiles) {
                const relFile = relative(baseCwd, file);
                console.log(`  ✓ ${relFile}`);
            }
        }

        console.log('\nPronto! Para começar, execute:\n');
        if (relativeFolder) {
            console.log(`  cd ${relativeFolder}`);
        }
        console.log(`  ${packageManager.getRunCommand('dev')}\n`);
    }

    if (template.finish) {
        await template.finish({
            context: ctx,
            packageManager,
            finish
        });
    } else {
        finish();
    }
}
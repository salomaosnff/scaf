
import { rm, stat } from "node:fs/promises";
import { join, relative } from "node:path";

import { input, select } from "@inquirer/prompts";
import type { ScaffoldContext } from "@create-scaf/template";
import { getPackageManager } from "./package_manager";
import { render } from "./render";
import { getTemplate } from "./template";


export interface RunTemplateOptions {
    template?: string;
    folder?: string;
    packageManager?: string;
    override?: boolean;
}

export type ScaffoldOptions = RunTemplateOptions;

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
        dependencies: {
            dependencies: [],
            devDependencies: []
        }
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

    Object.assign(ctx, await template.config?.(ctx));

    if (template.render) {
        await template.render({
            context: ctx,
            render(input, output) {
                return render(ctx, input, output);
            }
        });
    } else {
        await render(ctx, 'template')
    }

    async function install() {
        {
            const { promise, resolve, reject } = Promise.withResolvers<void>()
            packageManager.add(ctx.dependencies.dependencies).addListener('error', reject).addListener('close', resolve)
            await promise
        }
        {
            const { promise, resolve, reject } = Promise.withResolvers<void>()
            packageManager.addDev(ctx.dependencies.devDependencies).addListener('error', reject).addListener('close', resolve)
            await promise
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
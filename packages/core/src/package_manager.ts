import { select } from "@inquirer/prompts";
import { spawn, type ChildProcess } from "node:child_process";
import { delimiter, dirname } from "node:path";
import type { PackageManager } from "@create-scaf/template";

/**
 * Executa comandos do gerenciador de pacotes de forma robusta e multiplataforma.
 */
function safeSpawn(command: string, args: string[], cwd: string): ChildProcess {
    const binDir = dirname(process.execPath);
    const currentPath = process.env.PATH || '';
    const newPath = currentPath.includes(binDir)
        ? currentPath
        : `${binDir}${delimiter}${currentPath}`;

    const env = {
        ...process.env,
        PATH: newPath
    };

    const npmExecPath = process.env.npm_execpath;
    if (npmExecPath) {
        const execPathLower = npmExecPath.toLowerCase();
        if (
            (command === 'npm' && execPathLower.includes('npm')) ||
            (command === 'pnpm' && execPathLower.includes('pnpm')) ||
            (command === 'yarn' && execPathLower.includes('yarn'))
        ) {
            return spawn(process.execPath, [npmExecPath, ...args], {
                cwd,
                stdio: "inherit",
                env
            });
        }
    }

    const isWindows = process.platform === 'win32';

    return spawn(command, args, {
        cwd,
        stdio: "inherit",
        shell: isWindows,
        env
    });
}

/**
 * Cria a instância do gerenciador de pacotes NPM para o diretório informado.
 * @param cwd - Diretório de execução dos comandos.
 */
export function createNpm(cwd: string): PackageManager {
    return {
        install() {
            return safeSpawn("npm", ["install"], cwd);
        },
        add(dependencies: string[]) {
            return safeSpawn("npm", ["install", ...dependencies], cwd);
        },
        addDev(dependencies: string[]) {
            return safeSpawn("npm", ["install", "-D", ...dependencies], cwd);
        },
        getRunCommand(script) {
            return `npm run ${script}`;
        },
    };
}

/**
 * Cria a instância do gerenciador de pacotes PNPM para o diretório informado.
 * @param cwd - Diretório de execução dos comandos.
 */
export function createPnpm(cwd: string): PackageManager {
    return {
        install() {
            return safeSpawn("pnpm", ["install"], cwd);
        },
        add(dependencies: string[]) {
            return safeSpawn("pnpm", ["add", ...dependencies], cwd);
        },
        addDev(dependencies: string[]) {
            return safeSpawn("pnpm", ["add", "-D", ...dependencies], cwd);
        },
        getRunCommand(script) {
            return `pnpm ${script}`;
        },
    };
}

/**
 * Cria a instância do gerenciador de pacotes Yarn para o diretório informado.
 * @param cwd - Diretório de execução dos comandos.
 */
export function createYarn(cwd: string): PackageManager {
    return {
        install() {
            return safeSpawn("yarn", ["install"], cwd);
        },
        add(dependencies: string[]) {
            return safeSpawn("yarn", ["add", ...dependencies], cwd);
        },
        addDev(dependencies: string[]) {
            return safeSpawn("yarn", ["add", "-D", ...dependencies], cwd);
        },
        getRunCommand(script) {
            return `yarn ${script}`;
        },
    };
}

/**
 * Obtém ou descobre o gerenciador de pacotes adequado para o diretório do projeto.
 * Detecta via flag informada, `npm_config_user_agent` do ambiente ou pergunta ao usuário.
 * 
 * @param folder - Pasta do projeto de destino.
 * @param defaultPm - Nome do gerenciador de pacotes pré-definido (opcional).
 * @returns Instância do `PackageManager` correspondente.
 */
export async function getPackageManager(folder: string, defaultPm?: string): Promise<PackageManager> {
    const managers: Record<string, (cwd: string) => PackageManager> = {
        npm: createNpm,
        pnpm: createPnpm,
        yarn: createYarn
    };

    if (defaultPm && managers[defaultPm]) {
        return managers[defaultPm](folder);
    }

    const userAgent = process.env.npm_config_user_agent ?? '';

    // Captura o primeiro termo antes da barra (ex: 'pnpm' de 'pnpm/9.0.0')
    const spec = userAgent.split(' ')[0];
    const name = spec.split('/')?.[0] || await select({
        message: 'Selecione o gerenciador de pacotes',
        choices: ['npm', 'pnpm', 'yarn']
    });

    const createManager = managers[name] ?? createNpm;
    return createManager(folder);
}
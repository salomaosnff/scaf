import { select } from "@inquirer/prompts";
import { spawn } from "node:child_process";
import type { PackageManager } from "@create-scaf/template";

/**
 * Cria a instância do gerenciador de pacotes NPM para o diretório informado.
 * @param cwd - Diretório de execução dos comandos.
 */
export function createNpm(cwd: string): PackageManager {
    return {
        install() {
            return spawn("npm", ["install"], { cwd, stdio: "inherit" });
        },
        add(dependencies: string[]) {
            return spawn("npm", ["install", ...dependencies], { cwd, stdio: "inherit" });
        },
        addDev(dependencies: string[]) {
            return spawn("npm", ["install", "-D", ...dependencies], { cwd, stdio: "inherit" });
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
            return spawn("pnpm", ["install"], { cwd, stdio: "inherit" });
        },
        add(dependencies: string[]) {
            return spawn("pnpm", ["add", ...dependencies], { cwd, stdio: "inherit" });
        },
        addDev(dependencies: string[]) {
            return spawn("pnpm", ["add", "-D", ...dependencies], { cwd, stdio: "inherit" });
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
            return spawn("yarn", ["install"], { cwd, stdio: "inherit" });
        },
        add(dependencies: string[]) {
            return spawn("yarn", ["add", ...dependencies], { cwd, stdio: "inherit" });
        },
        addDev(dependencies: string[]) {
            return spawn("yarn", ["add", "-D", ...dependencies], { cwd, stdio: "inherit" });
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
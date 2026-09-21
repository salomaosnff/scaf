import { select } from "@inquirer/prompts"
import { spawn } from "node:child_process"
import type { PackageManager } from "@create-scaf/template"

/**
 * Gerenciador de pacotes NPM.
 */
export function createNpm(cwd: string): PackageManager {
    return {
        install() {
            return spawn("npm", ["install"], { cwd, stdio: "inherit" })
        },
        add(dependencies: string[]) {
            return spawn("npm", ["install", ...dependencies], { cwd, stdio: "inherit" })
        },
        addDev(dependencies: string[]) {
            return spawn("npm", ["install", "-D", ...dependencies], { cwd, stdio: "inherit" })
        },
        getRunCommand(script) {
            return `npm run ${script}`
        },
    }
}

/**
 * Gerenciador de pacotes PNPM.
 */
export function createPnpm(cwd: string): PackageManager {
    return {
        install() {
            return spawn("pnpm", ["install"], { cwd, stdio: "inherit" })
        },
        add(dependencies: string[]) {
            return spawn("pnpm", ["add", ...dependencies], { cwd, stdio: "inherit" })
        },
        addDev(dependencies: string[]) {
            return spawn("pnpm", ["add", "-D", ...dependencies], { cwd, stdio: "inherit" })
        },
        getRunCommand(script) {
            return `pnpm ${script}`
        },
    }
}

/**
 * Gerenciador de pacotes Yarn.
 */
export function createYarn(cwd: string): PackageManager {
    return {
        install() {
            return spawn("yarn", ["install"], { cwd, stdio: "inherit" })
        },
        add(dependencies: string[]) {
            return spawn("yarn", ["add", ...dependencies], { cwd, stdio: "inherit" })
        },
        addDev(dependencies: string[]) {
            return spawn("yarn", ["add", "-D", ...dependencies], { cwd, stdio: "inherit" })
        },
        getRunCommand(script) {
            return `yarn ${script}`
        },
    }
}

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
    })

    const createManager = managers[name] ?? createNpm;
    return createManager(folder);
}
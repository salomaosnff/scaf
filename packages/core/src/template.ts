import { execFile as execFileCallback } from "node:child_process";
import { stat, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { dirname, isAbsolute, join } from "node:path";
import type {
    ScaffoldContext,
    ScaffoldTemplate,
    ScaffoldTemplateInit,
    RenderContext,
    InstallContext,
    BannerContext,
    FinishContext,
    PackageManager
} from "@create-scaf/template";


const execFile = promisify(execFileCallback);

/**
 * Converte a identificação de um repositório em uma URL git válida e define seu caminho no cache.
 */
function parseRepository(repository: string): { gitUrl: string; cachePath: string } {
    if (isAbsolute(repository) || repository.startsWith('.')) {
        throw new Error(`Caminhos absolutos ou relativos iniciados com '.' não são permitidos: "${repository}"`);
    }

    const cacheBase = join(homedir(), '.cache', 'scaffold', 'templates');

    if (repository.startsWith('http://') || repository.startsWith('https://')) {
        const urlObj = new URL(repository);
        const cleanPath = urlObj.pathname.replace(/\.git$/, '');
        const cachePath = join(cacheBase, urlObj.hostname, cleanPath);
        return { gitUrl: repository, cachePath };
    }

    if (repository.startsWith('git@') || repository.startsWith('ssh://')) {
        const sshMatch = repository.match(/git@([^:]+):(.+)/) || repository.match(/ssh:\/\/git@([^/]+)\/(.+)/);
        if (sshMatch) {
            const host = sshMatch[1];
            const repoPath = sshMatch[2].replace(/\.git$/, '');
            const cachePath = join(cacheBase, host, repoPath);
            return { gitUrl: repository, cachePath };
        }
    }

    const gitUrl = `https://github.com/${repository}.git`;
    const cachePath = join(cacheBase, repository.replace(/\.git$/, ''));
    return { gitUrl, cachePath };
}

/**
 * Clona um repositório caso não tenha sido clonado ainda
 * Caso o repositório exista, tentar atualizar
 * Retornar o caminho do repositório
 * Repositórios são salvos em cache em `~/.cache/scaffold/templates/<repository>`
 * valores aceitos:
 * - user/repository
 * - URLs SSH ou HTTPS
 * 
 * Valores não aceitos:
 * - caminhos absolutos
 * - caminhos relativos começando com `.`
 * @param repository 
 */
async function getRepository(repository: string): Promise<string> {
    const { gitUrl, cachePath } = parseRepository(repository);

    const exists = await stat(cachePath).then(s => s.isDirectory()).catch(() => false);

    if (exists) {
        try {
            await execFile("git", ["pull"], { cwd: cachePath });
        } catch {
            // Em caso de falha de conexão no pull, utiliza o cache local existente
        }
    } else {
        await mkdir(dirname(cachePath), { recursive: true });
        await execFile("git", ["clone", gitUrl, cachePath]);
    }

    return cachePath;
}

/**
 * Obtém o objeto de template a partir de uma pasta local ou repositório remoto.
 * Procura dinamicamente pelos arquivos `template.ts` ou `template.js`.
 * 
 * @param template - Caminho para a pasta local do template ou repositório remoto.
 */
export async function getTemplate(template: string): Promise<ScaffoldTemplate> {
    let targetFolder: string;

    const baseCwd = process.env.INIT_CWD || process.cwd();
    const isLocalRelative = template.startsWith('.');
    const isLocalAbsolute = isAbsolute(template);

    const localCandidate = isLocalAbsolute ? template : join(baseCwd, template);
    const localStat = await stat(localCandidate).catch(() => null);

    if (localStat && localStat.isDirectory()) {
        targetFolder = localCandidate;
    } else if (isLocalRelative || isLocalAbsolute) {
        throw new Error(`Diretório local do template não encontrado: "${localCandidate}"`);
    } else {
        targetFolder = await getRepository(template);
    }

    const tsPath = join(targetFolder, 'template.ts');
    const jsPath = join(targetFolder, 'template.js');

    const hasTs = await stat(tsPath).then(s => s.isFile()).catch(() => false);
    const hasJs = await stat(jsPath).then(s => s.isFile()).catch(() => false);

    let templateFilePath: string;
    if (hasTs) {
        templateFilePath = tsPath;
    } else if (hasJs) {
        templateFilePath = jsPath;
    } else {
        throw new Error(`Arquivo template.ts ou template.js não encontrado no diretório: "${targetFolder}"`);
    }

    const fileUrl = pathToFileURL(templateFilePath).href;
    const importedModule = await import(fileUrl);
    const templateObj: ScaffoldTemplate = importedModule.default ?? importedModule.template ?? importedModule;

    if (!templateObj.folder) {
        templateObj.folder = targetFolder;
    }

    return templateObj;
}
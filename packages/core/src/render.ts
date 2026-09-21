import type { ScaffoldContext } from "@create-scaf/template";
import ejs from 'ejs';
import { cp, glob, mkdir, stat, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from 'node:path';

/**
 * Renderiza um arquivo de template EJS utilizando o contexto do scaffolding e salva no destino.
 * @param context - O contexto do scaffolding contendo as variáveis do projeto.
 * @param templateFile - O caminho relativo do arquivo de template.
 * @param outputFilename - O caminho final do arquivo gerado.
 */
async function renderFile(context: ScaffoldContext, templateFile: string, outputFilename: string) {
    const rendered = await ejs.renderFile(templateFile, context);
    if (rendered.trim() === '') {
        return;
    }
    await mkdir(dirname(outputFilename), { recursive: true });
    await writeFile(outputFilename, rendered);
}

/**
 * Copia arquivos especificando um caminho de origem para o destino.
 * @param src - Caminho do arquivo de origem.
 * @param destination - Caminho de destino final.
 */
async function copy(src: string, destination: string) {
    await mkdir(dirname(destination), { recursive: true });
    await cp(src, destination, { recursive: true });
}

/**
 * Renderiza todos os arquivos de um diretório de template para o diretório de destino.
 * - Arquivos `.ejs.ejs` são apenas copiados como `.ejs` (sem serem renderizados).
 * - Arquivos `.ejs` são renderizados via `renderFile` e salvos sem a extensão `.ejs`.
 * - Demais arquivos são copiados com a extensão original.
 * 
 * @param context - O contexto do scaffolding contendo as variáveis do projeto.
 * @param pattern - Padrão glob dos arquivos a serem renderizados.
 * @param outputFolder - O caminho do diretório de destino.
 * @returns Lista de caminhos absolutos dos arquivos criados.
 */
export async function render(
    context: ScaffoldContext,
    pattern: string = '**/*',
    outputFolder: string = '.',
): Promise<string[]> {
    outputFolder = resolve(context.folder, outputFolder);
    const createdFiles: string[] = [];

    if (!Array.isArray(context.createdFiles)) {
        context.createdFiles = [];
    }

    for await (const relPath of glob(pattern, { cwd: context.renderFolder })) {
        const fullSrcPath = join(context.renderFolder, relPath);
        const fileStat = await stat(fullSrcPath).catch(() => null);

        if (!fileStat || !fileStat.isFile()) {
            continue;
        }

        let destPath: string;
        if (relPath.endsWith('.ejs.ejs')) {
            destPath = join(outputFolder, relPath.slice(0, -4));
            await copy(fullSrcPath, destPath);
        } else if (relPath.endsWith('.ejs')) {
            destPath = join(outputFolder, relPath.slice(0, -4));
            await renderFile(context, fullSrcPath, destPath);
        } else {
            destPath = join(outputFolder, relPath);
            await copy(fullSrcPath, destPath);
        }

        createdFiles.push(destPath);
        if (!(context.createdFiles as string[]).includes(destPath)) {
            (context.createdFiles as string[]).push(destPath);
        }
    }

    return createdFiles;
}
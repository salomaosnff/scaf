import type { ScaffoldContext } from "@create-scaf/template";
import ejs from 'ejs';
import { cp, glob, mkdir, stat, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from 'node:path'

/**
 * Renderiza um arquivo de template EJS utilizando o contexto do scaffolding e salva no destino.
 * @param context - O contexto do scaffolding contendo as variáveis do projeto.
 * @param templateFile - O caminho relativo do arquivo de template.
 * @param outputFilename - O caminho final do arquivo gerado.
 */
async function renderFile(context: ScaffoldContext, templateFile: string, outputFilename: string) {
    const rendered = await ejs.renderFile(templateFile, context)
    if (rendered.trim() === '') {
        return
    }
    await mkdir(dirname(outputFilename), { recursive: true })
    await writeFile(outputFilename, rendered)
}

/**
 * Copia arquivos ou diretórios especificando um caminho ou padrão glob para o destino.
 * @param pattern - Caminho do arquivo/diretório de origem ou padrão glob.
 * @param destination - Diretório ou caminho de destino.
 */
async function copy(pattern: string, destination: string) {
    const isGlobPattern = /[*\?\[\]]/.test(pattern);

    if (isGlobPattern) {
        for await (const entry of glob(pattern)) {
            const entryStat = await stat(entry).catch(() => null);
            if (entryStat && entryStat.isFile()) {
                const destPath = join(destination, entry);
                await mkdir(dirname(destPath), { recursive: true });
                await cp(entry, destPath);
            }
        }
    } else {
        await mkdir(dirname(destination), { recursive: true });
        await cp(pattern, destination, { recursive: true });
    }
}

/**
 * Renderiza todos os arquivos de um diretório de template para o diretório de destino.
 * - Arquivos `.ejs.ejs` são apenas copiados como `.ejs` (sem serem renderizados).
 * - Arquivos `.ejs` são renderizados via `renderFile` e salvos sem a extensão `.ejs`.
 * - Demais arquivos são copiados com a extensão original.
 * 
 * @param context - O contexto do scaffolding contendo as variáveis do projeto.
 * @param templateFolder - O caminho do diretório de template.
 * @param outputFolder - O caminho do diretório de destino (padrão: `"."`).
 */
export async function render(
    context: ScaffoldContext,
    pattern: string = '**/*',
    outputFolder: string = '.',
) {
    outputFolder = resolve(context.folder, outputFolder)

    for await (const relPath of glob(pattern, { cwd: context.renderFolder })) {
        const fullSrcPath = join(context.renderFolder, relPath);
        const fileStat = await stat(fullSrcPath).catch(() => null);

        if (!fileStat || !fileStat.isFile()) {
            continue;
        }

        if (relPath.endsWith('.ejs.ejs')) {
            // Copia apenas como .ejs sem renderizar
            const destPath = join(outputFolder, relPath.slice(0, -4));
            await copy(fullSrcPath, destPath);
        } else if (relPath.endsWith('.ejs')) {
            // Renderiza o arquivo .ejs e salva sem a extensão .ejs
            const destPath = join(outputFolder, relPath.slice(0, -4));
            await renderFile(context, fullSrcPath, destPath);
        } else {
            // Copia demais arquivos mantendo a extensão original
            const destPath = join(outputFolder, relPath);
            await copy(fullSrcPath, destPath);
        }
    }
}
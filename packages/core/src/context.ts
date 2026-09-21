import type { ScaffoldContext } from "@create-scaf/template";

/**
 * Cria uma estrutura de contexto inicial padrão para a execução de um template.
 * 
 * @param folder - Caminho do diretório de destino do novo projeto.
 * @param templateFolder - Caminho do diretório do template a ser utilizado.
 * @returns Objeto de contexto inicial tipado como `ScaffoldContext`.
 */
export function createDefaultContext(folder: string, templateFolder: string): ScaffoldContext {
    return {
        folder,
        templateFolder,
        renderFolder: `${templateFolder}/template`,
        dependencies: [],
        devDependencies: []
    };
}
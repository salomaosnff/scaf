import type { ScaffoldContext } from "@create-scaf/template";

export function createDefaultContext(folder: string, templateFolder: string): ScaffoldContext {
    return {
        folder,
        templateFolder,
        renderFolder: `${templateFolder}/template`,
        dependencies: {
            dependencies: [],
            devDependencies: []
        }
    };
}
import { defineTemplate } from "@create-scaf/template";
import { select, confirm } from "@create-scaf/template/inquirer";
import { basename, join } from "node:path";

export default defineTemplate({
    name: "Vue 3 + Vite",
    banner: `
 ⚡ VUE 3 SCAFFOLDER ⚡
 ───────────────────────────────────────────────────
  Gerador de Projetos Vue 3 + TypeScript / JavaScript
 ───────────────────────────────────────────────────
`,
    prompts: {
        lang: {
            flags: "-l, --lang <value>",
            description: "Selecione a linguagem do projeto (ts ou js)",
            prompt: () => select({
                message: "Selecione a linguagem do projeto:",
                choices: [
                    { name: "TypeScript", value: "ts" },
                    { name: "JavaScript", value: "js" }
                ]
            })
        },
        router: {
            flags: "-r, --router",
            description: "Utilizar Vue Router",
            prompt: () => confirm({ message: "Utilizar Vue Router?" })
        },
        eslint: {
            flags: "-e, --eslint",
            description: "Configurar ESLint",
            prompt: () => confirm({ message: "Configurar ESLint?" })
        },
        prettier: {
            flags: "-p, --prettier",
            description: "Configurar Prettier",
            prompt: () => confirm({ message: "Configurar Prettier?" })
        }
    },
    async config({ prompts, context }) {
        const variant = await prompts.lang();
        const vueRouter = await prompts.router();
        const useEslint = await prompts.eslint();
        const usePrettier = await prompts.prettier();

        // Dependências de produção
        context.dependencies.push("vue");

        // Dependências de desenvolvimento
        context.devDependencies.push("vite", "@vitejs/plugin-vue");

        if (variant === "ts") {
            context.devDependencies.push("typescript", "vue-tsc", "@types/node");
        }

        if (vueRouter) {
            context.dependencies.push("vue-router");
        }

        if (useEslint) {
            context.devDependencies.push("eslint", "eslint-plugin-vue");
            if (variant === "ts") {
                context.devDependencies.push("@vue/eslint-config-typescript");
            }
        }

        if (usePrettier) {
            context.devDependencies.push("prettier");
            if (useEslint) {
                context.devDependencies.push("eslint-config-prettier", "eslint-plugin-prettier@^5.2.0");
            }
        }

        const renderFolderName = variant === "ts" ? "vue-vanilla-ts" : "vue-vanilla-js";

        return {
            variant,
            project: {
                name: basename(context.folder)
            },
            vueRouter,
            useEslint,
            usePrettier,
            renderFolder: join(context.templateFolder, renderFolderName)
        };
    },
    async render({ render, context }) {
        context.renderFolder = join(context.templateFolder, context.variant === "ts" ? "vue-vanilla-ts" : "vue-vanilla-js");
        await render("**/*");
    },
    install({ install }) {
        return install();
    },
});
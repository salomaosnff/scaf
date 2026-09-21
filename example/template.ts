import { select, confirm, defineTemplate } from "@create-scaf/template";
import { basename, join } from "node:path";

export default defineTemplate({
    name: "Vue 3 + Vite",
    banner: `
 ⚡ VUE 3 SCAFFOLDER ⚡
 ───────────────────────────────────────────────────
  Gerador de Projetos Vue 3 + TypeScript / JavaScript
 ───────────────────────────────────────────────────
`,
    async config(ctx) {
        const variant = await select({
            message: 'Selecione a linguagem do projeto:',
            choices: [
                { name: 'TypeScript', value: 'ts' },
                { name: 'JavaScript', value: 'js' }
            ]
        });

        const vueRouter = await confirm({ message: 'Utilizar Vue Router?' });
        const useEslint = await confirm({ message: 'Configurar ESLint?' });
        const usePrettier = await confirm({ message: 'Configurar Prettier?' });

        // Dependências de produção
        ctx.dependencies.dependencies.push('vue');

        // Dependências de desenvolvimento
        ctx.dependencies.devDependencies.push('vite', '@vitejs/plugin-vue');

        if (variant === 'ts') {
            ctx.dependencies.devDependencies.push('typescript', 'vue-tsc', '@types/node');
        }

        if (vueRouter) {
            ctx.dependencies.dependencies.push('vue-router');
        }

        if (useEslint) {
            ctx.dependencies.devDependencies.push('eslint', 'eslint-plugin-vue');
            if (variant === 'ts') {
                ctx.dependencies.devDependencies.push('@vue/eslint-config-typescript');
            }
        }

        if (usePrettier) {
            ctx.dependencies.devDependencies.push('prettier');
            if (useEslint) {
                ctx.dependencies.devDependencies.push('eslint-config-prettier', 'eslint-plugin-prettier@^5.2.0');
            }
        }

        const renderFolderName = variant === 'ts' ? 'vue-vanilla-ts' : 'vue-vanilla-js';

        return {
            variant,
            project: {
                name: basename(ctx.folder)
            },
            vueRouter,
            useEslint,
            usePrettier,
            renderFolder: join(ctx.templateFolder, renderFolderName)
        };
    },
    render({ render, context }) {
        context.renderFolder = join(context.templateFolder, context.variant === 'ts' ? 'vue-vanilla-ts' : 'vue-vanilla-js');
        return render('**/*');
    },
    install({ install }) {
        return install();
    },
});
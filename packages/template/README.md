# @create-scaf/template

`@create-scaf/template` fornece as definições de tipo, auxiliares de construção (`defineTemplate`) e utilitários de perguntas interativas (prompts) para autores de templates do **create-scaf**.

---

## 📦 Instalação

```bash
pnpm add @create-scaf/template
# ou
npm install @create-scaf/template
```

---

## 🚀 Como Usar

No arquivo `template.ts` ou `template.js` da raiz do seu template:

```ts
import { defineTemplate } from "@create-scaf/template";
import { confirm, input } from "@create-scaf/template/inquirer";

export default defineTemplate({
    name: "Meu Template Customizado",
    banner: "🚀 INICIANDO SCAFFOLDING 🚀",
    prompts: {
        ts: {
            flags: "-t, --typescript",
            description: "Usar TypeScript",
            prompt: () => confirm({ message: "Usar TypeScript?" })
        }
    },
    async config({ prompts, context }) {
        const useTypeScript = await prompts.ts();

        context.dependencies.push("express");
        if (useTypeScript) {
            context.devDependencies.push("typescript");
        }

        return {
            useTypeScript
        };
    },
    async render({ render }) {
        await render("**/*");
    },
    async install({ install }) {
        await install();
    },
    finish({ packageManager }) {
        console.log(`\nExecute ${packageManager.getRunCommand('dev')} para começar!\n`);
    }
});
```

---

## ⚙️ Subpath Export para Inquirer Prompts

Você pode importar diretamente os prompts do `@inquirer/prompts` via subpath:

```ts
import { select, confirm, input, checkbox } from "@create-scaf/template/inquirer";
```

---

## 📜 Licença

MIT

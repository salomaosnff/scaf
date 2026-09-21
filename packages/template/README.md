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
import { defineTemplate, select, confirm, input } from "@create-scaf/template";

export default defineTemplate({
    name: "Meu Template Customizado",
    banner: "🚀 INICIANDO SCAFFOLDING 🚀",
    async config(ctx) {
        const projectName = await input({ message: "Nome do projeto:" });
        const useTypeScript = await confirm({ message: "Usar TypeScript?" });

        ctx.dependencies.push("express");

        return {
            projectName,
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

Você pode importar diretamente os prompts de inquirer via subpath:

```ts
import { select, confirm, input } from "@create-scaf/template/inquirer";
```

---

## 📜 Licença

MIT

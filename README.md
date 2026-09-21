# create-scaf

⚡ **create-scaf** é uma ferramenta moderna e extensível para inicialização (scaffolding) de novos projetos a partir de templates locais ou repositórios remotos do GitHub.

---

## 🚀 Arquitetura do Monorepo

O repositório é estruturado como um monorepo PNPM composto por 3 pacotes principais:

| Pacote | Descrição |
| --- | --- |
| [**`create-scaf`**](./packages/create-scaf) | CLI binário executável (`pnpm create scaf` / `npx create-scaf`). |
| [**`@create-scaf/core`**](./packages/core) | Motor (engine) de scaffolding programático e resolução de templates. |
| [**`@create-scaf/template`**](./packages/template) | Tipos, utilitários (`defineTemplate`) e prompts interativos para autores de templates. |

---

## ⚡ Uso da CLI

Você pode executar o `create-scaf` especificando o `<template>` obrigatório e opcionalmente a pasta `[destination]`:

```bash
# Sintaxe padrão: create-scaf <template> [destination]
pnpm create scaf salomaosnff/vue-vanilla

# Especificando a pasta de destino
pnpm create scaf salomaosnff/vue-vanilla meu-projeto

# Usando um template local
pnpm create scaf ./meu-template-local meu-projeto

# Passando opções do template diretamente via CLI
pnpm create scaf ./meu-template-local meu-projeto -l ts -e
```

### 📋 Exibição da Ajuda e Opções do Template

O `create-scaf` organiza automaticamente as opções globais e as opções exclusivas do template selecionado:

```text
Usage: create-scaf <template> [destination]

Scaffold a new project from a template

Arguments:
  template                      Nome do template ou repositório
  destination                   Pasta de destino do projeto

Options:
  -p, --package-manager <name>  Define o gerenciador de pacotes (npm, pnpm, yarn)
  -f, --force                   Sobreescreve a pasta destino se ela existir
  -h, --help                    display help for command

Template Options:
  -l, --lang <value>            Selecione a linguagem do projeto (ts ou js)
  -r, --router                  Utilizar Vue Router
  -e, --eslint                  Configurar ESLint
```

---

## 💡 Como Criar um Template

Para criar um novo template compatível com o `create-scaf`, instale o `@create-scaf/template` e crie um arquivo `template.ts` (ou `template.js`) na raiz do seu repositório ou pasta:

```ts
import { defineTemplate } from "@create-scaf/template";
import { select, confirm } from "@create-scaf/template/inquirer";
import { join } from "node:path";

export default defineTemplate({
    name: "Vue 3 + Vite",
    banner: "⚡ GERAÇÃO DE PROJETO VUE 3 ⚡",
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
        eslint: {
            flags: "-e, --eslint",
            description: "Configurar ESLint",
            prompt: () => confirm({ message: "Configurar ESLint?" })
        }
    },
    async config({ prompts, context }) {
        const variant = await prompts.lang();
        const useEslint = await prompts.eslint();

        // Adiciona dependências de produção e desenvolvimento
        context.dependencies.push("vue");
        context.devDependencies.push("vite", "@vitejs/plugin-vue");

        if (variant === "ts") {
            context.devDependencies.push("typescript", "vue-tsc");
        }

        if (useEslint) {
            context.devDependencies.push("eslint", "eslint-plugin-vue");
        }

        return {
            variant,
            useEslint,
            renderFolder: join(context.templateFolder, variant === "ts" ? "vue-ts" : "vue-js")
        };
    },
    render({ render }) {
        return render("**/*");
    },
    install({ install }) {
        return install();
    }
});
```

---

## 🛠️ Desenvolvimento Local

```bash
# 1. Instalar dependências no monorepo
pnpm install

# 2. Compilar todos os pacotes
pnpm build

# 3. Executar em modo desenvolvimento
pnpm dev ./example --help
```

---

## 📄 Licença

MIT © Salomão Neto

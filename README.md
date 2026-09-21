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

## ⚡ Uso do CLI

Você pode executar o `create-scaf` diretamente utilizando qualquer gerenciador de pacotes:

```bash
# Uso com pnpm
pnpm create scaf salomaosnff/vue-vanilla

# Especificando a pasta de destino
pnpm create scaf salomaosnff/vue-vanilla meu-projeto

# Usando a flag --template
pnpm create scaf --template salomaosnff/vue-vanilla meu-projeto

# Usando um template local
pnpm create scaf --template ./meu-template-local meu-projeto
```

### 📋 Opções e Flags

```text
Usage: create-scaf [options] [arg1] [arg2]

Arguments:
  arg1                          Template ou pasta de destino
  arg2                          Pasta de destino (quando arg1 for o template)

Options:
  -t, --template <template>     Define o template a ser utilizado
  -p, --package-manager <name>  Define o gerenciador de pacotes (npm, pnpm, yarn)
  -f, --force                   Sobreescreve a pasta destino se ela existir
  -h, --help                    Exibe ajuda do comando
```

---

## 💡 Como Criar um Template

Para criar um novo template compatível com o `create-scaf`, instale o `@create-scaf/template` e crie um arquivo `template.ts` (ou `template.js`) na raiz do seu repositório ou pasta:

```ts
import { defineTemplate, select, confirm } from "@create-scaf/template";
import { join } from "node:path";

export default defineTemplate({
    name: "Vue 3 + Vite",
    banner: "⚡ GERAÇÃO DE PROJETO VUE 3 ⚡",
    async config(ctx) {
        const variant = await select({
            message: "Selecione a linguagem:",
            choices: [
                { name: "TypeScript", value: "ts" },
                { name: "JavaScript", value: "js" }
            ]
        });

        const useEslint = await confirm({ message: "Configurar ESLint?" });

        // Adiciona dependências acumuladas
        ctx.dependencies.dependencies.push("vue");
        ctx.dependencies.devDependencies.push("vite");

        return {
            variant,
            useEslint,
            renderFolder: join(ctx.templateFolder, variant === "ts" ? "vue-ts" : "vue-js")
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

# 3. Executar em modo desenvolvimento (usando tsx no pacote create-scaf)
pnpm dev --help
```

---

## 📄 Licença

MIT © Salomão Neto

# @create-scaf/core

`@create-scaf/core` é o motor (engine) de scaffolding programático do **create-scaf**. Responsável por resolver templates (locais ou remotos do Git), renderizar arquivos EJS, gerenciar dependências e executar o ciclo de vida de scaffolding.

---

## 📦 Instalação

```bash
pnpm add @create-scaf/core
# ou
npm install @create-scaf/core
```

---

## 🚀 Uso Programático

```ts
import { scaffold } from "@create-scaf/core";

async function main() {
    await scaffold({
        template: "salomaosnff/vue-vanilla",
        folder: "./meu-novo-projeto",
        packageManager: "pnpm",
        override: true
    });
}

main();
```

---

## 🛠️ APIs Exportadas

- **`scaffold(options)`**: Executa o fluxo completo de geração.
- **`getTemplate(templatePath)`**: Resolve e carrega um template local ou do GitHub.
- **`getPackageManager(folder, defaultPm)`**: Detecta ou instancia o gerenciador de pacotes (NPM, PNPM, Yarn).
- **`render(context, pattern, outputFolder)`**: Renderiza modelos EJS e copia arquivos do template.
- **`createDefaultContext(folder, templateFolder)`**: Cria a estrutura inicial do contexto.
- Reexporta todas as definições e tipos do [`@create-scaf/template`](../template).

---

## 📜 Licença

MIT

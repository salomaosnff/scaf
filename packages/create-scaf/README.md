# create-scaf

Binário CLI oficial para criação rápida de projetos a partir de templates locais ou repositórios remotos do GitHub.

---

## 🚀 Como Usar

Você pode executar o `create-scaf` sem necessidade de instalação global:

```bash
# Sintaxe padrão: create-scaf <template> [destination]
pnpm create scaf salomaosnff/vue-vanilla

# Com npx
npx create-scaf salomaosnff/vue-vanilla meu-projeto

# Usando um template da sua máquina local
npx create-scaf ./caminho/do/template meu-projeto

# Passando argumentos do template via CLI
npx create-scaf ./caminho/do/template meu-projeto -l ts -e
```

---

## 📋 Flags e Opções

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

## 📜 Licença

MIT

# create-scaf

Binário CLI oficial para criação rápida de projetos a partir de templates locais ou repositórios remotos do GitHub.

---

## 🚀 Como Usar

Você pode executar o `create-scaf` sem necessidade de instalação global:

```bash
# Com pnpm
pnpm create scaf salomaosnff/vue-vanilla

# Com npx
npx create-scaf salomaosnff/vue-vanilla meu-projeto

# Especificando a flag --template
pnpm create scaf --template salomaosnff/vue-vanilla meu-projeto

# Usando um template da sua máquina local
pnpm create scaf --template ./caminho/do/template meu-projeto
```

---

## 📋 Flags e Opções

```text
Usage: create-scaf [options] [arg1] [arg2]

Arguments:
  arg1                          Template ou pasta de destino
  arg2                          Pasta de destino (quando arg1 for o template)

Options:
  -t, --template <template>     Define o template a ser utilizado
  -p, --package-manager <name>  Define o gerenciador de pacotes (npm, pnpm, yarn)
  -f, --force                   Sobreescreve a pasta destino se ela existir
  -h, --help                    Exibe a ajuda do comando
```

---

## 📜 Licença

MIT

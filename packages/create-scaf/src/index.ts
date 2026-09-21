/**
 * Ponto de entrada da CLI `create-scaf`.
 * Configura as opções do Commander e repassa a execução para o mecanismo de scaffolding do `@create-scaf/core`.
 */
import { Command } from "commander";
import { scaffold } from "@create-scaf/core";

const program = new Command();

program
    .name("create-scaf")
    .description("Scaffold a new project from a template")
    .argument("[arg1]", "Template ou pasta de destino")
    .argument("[arg2]", "Pasta de destino (quando arg1 for o template)")
    .option("-t, --template <template>", "Define o template a ser utilizado")
    .option("-p, --package-manager <name>", "Define o gerenciador de pacotes (npm, pnpm, yarn)")
    .option("-f, --force", "Sobreescreve a pasta destino se ela existir")
    .action((arg1, arg2, options) => {
        let template: string | undefined = options.template;
        let folder: string | undefined;

        if (template) {
            folder = arg1;
        } else {
            template = arg1;
            folder = arg2;
        }

        return scaffold({
            template,
            folder,
            packageManager: options.packageManager,
            override: options.force
        });
    });

program.parse(process.argv);
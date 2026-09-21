/**
 * Ponto de entrada da CLI `create-scaf`.
 * Configura as opções do Commander e repassa a execução para o mecanismo de scaffolding do `@create-scaf/core`.
 */
import { Command } from "commander";
import { scaffold, getTemplate } from "@create-scaf/core";

async function run() {
    const program = new Command();

    program
        .name("create-scaf")
        .usage("<template> [destination]")
        .description("Scaffold a new project from a template")
        .argument("<template>", "Nome do template ou repositório")
        .argument("[destination]", "Pasta de destino do projeto")
        .option("-p, --package-manager <name>", "Define o gerenciador de pacotes (npm, pnpm, yarn)")
        .option("-f, --force", "Sobreescreve a pasta destino se ela existir")
        .allowUnknownOption(true);

    program.configureHelp({
        formatHelp(cmd, helper) {
            const termWidth = helper.padWidth(cmd, helper);
            const output: string[] = [];

            const usage = helper.commandUsage(cmd);
            if (usage) {
                output.push(`Usage: ${usage}\n`);
            }

            const commandDescription = helper.commandDescription(cmd);
            if (commandDescription) {
                output.push(`${commandDescription}\n`);
            }

            const visibleArguments = helper.visibleArguments(cmd);
            if (visibleArguments.length > 0) {
                output.push("Arguments:");
                for (const argument of visibleArguments) {
                    output.push(helper.formatItem(helper.argumentTerm(argument), termWidth, helper.argumentDescription(argument) || "", helper));
                }
                output.push("");
            }

            const globalOptions: any[] = [];
            const templateOptions: any[] = [];

            for (const option of helper.visibleOptions(cmd)) {
                if ((option as any).isTemplateOption) {
                    templateOptions.push(option);
                } else {
                    globalOptions.push(option);
                }
            }

            if (globalOptions.length > 0) {
                output.push("Options:");
                for (const option of globalOptions) {
                    output.push(helper.formatItem(helper.optionTerm(option), termWidth, helper.optionDescription(option) || "", helper));
                }
                output.push("");
            }

            if (templateOptions.length > 0) {
                output.push("Template Options:");
                for (const option of templateOptions) {
                    output.push(helper.formatItem(helper.optionTerm(option), termWidth, helper.optionDescription(option) || "", helper));
                }
                output.push("");
            }

            return output.join("\n");
        }
    });

    // Identifica o nome do template a partir do primeiro argumento posicional antes da analise completa
    const { operands } = program.parseOptions(process.argv.slice(2));
    const candidateTemplate = operands[0];

    if (candidateTemplate) {
        try {
            const templateObj = await getTemplate(candidateTemplate);
            const templatePrompts = templateObj.prompts ?? templateObj.args;
            if (templatePrompts) {
                for (const [key, argDef] of Object.entries(templatePrompts)) {
                    if (argDef && typeof argDef === "object") {
                        const flags = argDef.flags || `--${key} <value>`;
                        const description = argDef.description || `Argumento do template: ${key}`;
                        program.option(flags, description, argDef.default);

                        const addedOption = program.options[program.options.length - 1];
                        if (addedOption) {
                            (addedOption as any).isTemplateOption = true;
                        }
                    }
                }
            }
        } catch {
            // Caso o template não seja encontrado nesta fase, prossegue com as opções padrão
        }
    }

    program.action((template, folder, options) => {
        const { packageManager, force, ...customArgs } = options;

        return scaffold({
            template,
            folder,
            packageManager,
            override: force,
            args: customArgs
        });
    });

    await program.parseAsync(process.argv);
}

run();
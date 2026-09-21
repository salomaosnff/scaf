import type { ChildProcess } from "node:child_process";

/**
 * Representa as dependências declaradas para o projeto gerado.
 */
export interface Dependencies {
    /** Lista de dependências de produção. */
    dependencies: string[];
    /** Lista de dependências de desenvolvimento. */
    devDependencies: string[];
}

/**
 * Contexto principal passado e compartilhado durante a execução do scaffolding.
 */
export interface ScaffoldContext {
    /** Caminho da pasta de destino onde o projeto será gerado. */
    folder: string;
    /** Caminho absoluto da pasta raiz do template. */
    templateFolder: string;
    /** Caminho da pasta de templates a ser renderizada. */
    renderFolder: string;
    /** Gerenciador de dependências acumuladas. */
    dependencies: Dependencies;
    /** Lista de caminhos absolutos dos arquivos criados durante a renderização. */
    createdFiles?: string[];
    /** Propriedades adicionais arbitrárias inseridas durante a etapa de configuração. */
    [k: string]: unknown;
}

/**
 * Interface que abstrai o gerenciador de pacotes (npm, pnpm, yarn).
 */
export interface PackageManager {
    /** Executa a instalação de dependências no projeto. */
    install(): ChildProcess;
    /** Adiciona dependências de produção ao projeto. */
    add(dependencies: string[]): ChildProcess;
    /** Adiciona dependências de desenvolvimento (`devDependencies`) ao projeto. */
    addDev(dependencies: string[]): ChildProcess;
    /** Retorna o comando `run` formatado para o gerenciador atual. */
    getRunCommand(script: string): string;
}

/**
 * Definição de um argumento de template.
 */
export interface TemplatePromptObject<T = any> {
    /** Flags do Commander (ex: '-l, --lang <value>' ou '--lang <value>'). */
    flags?: string;
    /** Descrição do argumento exibida na CLI e no --help. */
    description?: string;
    /** Valor padrão caso o argumento não seja informado. */
    default?: T;
    /** Função interativa de prompt a ser executada caso a flag não seja informada na CLI. */
    prompt(): Promise<T>;
}

/**
 * Inferência do tipo de retorno de um prompt a partir da sua função de prompt ou default.
 */
export type InferPromptType<T> = T extends TemplatePromptObject<infer U> ? U : unknown;

/**
 * Mapeamento das chaves de prompts para funções assíncronas de resolução lazy.
 */
export type TemplatePromptsMap<P> = {
    [K in keyof P]: () => Promise<InferPromptType<P[K]>>;
};

/**
 * Contexto fornecido para a etapa de configuração do template.
 */
export interface ConfigContext<
    Config = Record<string, unknown>,
    Prompts = Record<string, any>
> {
    /** Contexto acumulado do gerador. */
    context: ScaffoldContext & Config;
    /** Prompts da CLI / Template resolvidos de forma lazy. */
    prompts: TemplatePromptsMap<Prompts>;
}

/**
 * Contexto fornecido para o gancho de renderização do template.
 */
export interface RenderContext<Config = Record<string, unknown>> {
    /** Objeto de contexto acumulado no gerador. */
    context: ScaffoldContext & Config;
    /**
     * Função para renderizar um padrão de arquivos do template no destino.
     * @param input - Padrão glob ou arquivo relativo a ser renderizado.
     * @param output - Pasta ou arquivo de destino relativo.
     * @returns Promessa com a lista de caminhos absolutos dos arquivos gerados.
     */
    render(input: string, output?: string): Promise<string[] | void>;
}

/**
 * Contexto fornecido para o gancho de instalação de dependências.
 */
export interface InstallContext<Config extends Record<string, unknown> = Record<string, unknown>> {
    /** Objeto de contexto acumulado no gerador. */
    context: ScaffoldContext & Config;
    /** Instância do gerenciador de pacotes selecionado. */
    packageManager: PackageManager;
    /** Executa a instalação padrão das dependências acumuladas em `context.dependencies`. */
    install(): Promise<void>;
}

/**
 * Contexto fornecido para a geração da mensagem de banner inicial.
 */
export interface BannerContext<Config extends Record<string, unknown> = Record<string, unknown>> {
    /** Objeto de contexto atual (se disponível). */
    context?: ScaffoldContext & Config;
    /** Definição do template executado. */
    template: ScaffoldTemplate<Config, any>;
}

/**
 * Contexto fornecido para o gancho de finalização do processo.
 */
export interface FinishContext<Config = Record<string, unknown>> {
    /** Objeto de contexto final acumulado. */
    context: ScaffoldContext & Config;
    /** Instância do gerenciador de pacotes selecionado. */
    packageManager: PackageManager;
    /** Exibe a mensagem de instrução pós-geração padrão. */
    finish(): void;
}

/**
 * Definição completa do contrato de um template de scaffolding.
 */
export interface ScaffoldTemplate<
    Config extends Record<string, unknown> = Record<string, unknown>,
    Prompts extends Record<string, any> = Record<string, any>
> {
    /** Nome amigável do template. */
    name?: string;
    /** Caminho absoluto do diretório do template. */
    folder?: string;
    /** Mapeamento de argumentos configuráveis da linha de comando e prompts. */
    prompts?: Prompts;
    /** Alias para prompts configuráveis. */
    args?: Prompts;
    /** Banner visual exibido no início da execução. */
    banner?: string | ((context?: BannerContext<Config>) => Promise<void | string> | void | string);
    /** Etapa de configuração e perguntas interativas. */
    config?(context: ConfigContext<Config, Prompts>): Promise<Partial<Config> | void> | Partial<Config> | void;
    /** Etapa de renderização dos arquivos de template. */
    render?(context: RenderContext<Config>): Promise<void> | void;
    /** Etapa personalizada de instalação de dependências. */
    install?(context: InstallContext<Config>): Promise<void> | void;
    /** Etapa final após a geração do processo. */
    finish?(context: FinishContext<Config>): Promise<void> | void;
}

/**
 * Alias mantido para compatibilidade com inicialização de templates.
 */
export type ScaffoldTemplateInit<
    Config extends Record<string, unknown> = Record<string, unknown>,
    Prompts extends Record<string, any> = Record<string, any>
> = ScaffoldTemplate<Config, Prompts>;

/**
 * Função utilitária para definir um template de scaffolding com inferência estrita de tipos.
 * @param template - Objeto de configuração do template.
 * @returns O próprio objeto de template tipado.
 */
export function defineTemplate<
    const Config extends Record<string, unknown> = Record<string, unknown>,
    const Prompts extends Record<string, any> = Record<string, any>
>(template: ScaffoldTemplate<Config, Prompts>): ScaffoldTemplate<Config, Prompts> {
    return template;
}
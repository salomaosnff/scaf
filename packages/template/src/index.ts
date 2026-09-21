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
 * Contexto fornecido para o gancho de renderização do template.
 */
export interface RenderContext<Context> {
    /** Objeto de contexto acumulado no gerador. */
    context: Context;
    /**
     * Função para renderizar um padrão de arquivos do template no destino.
     * @param input - Padrão glob ou arquivo relativo a ser renderizado.
     * @param output - Pasta ou arquivo de destino relativo.
     */
    render(input: string, output?: string): Promise<void>;
}

/**
 * Contexto fornecido para o gancho de instalação de dependências.
 */
export interface InstallContext<Context> {
    /** Objeto de contexto acumulado no gerador. */
    context: Context;
    /** Instância do gerenciador de pacotes selecionado. */
    packageManager: PackageManager;
    /** Executa a instalação padrão das dependências acumuladas em `context.dependencies`. */
    install(): Promise<void>;
}

/**
 * Contexto fornecido para a geração da mensagem de banner inicial.
 */
export interface BannerContext<Context> {
    /** Objeto de contexto atual (se disponível). */
    context?: Context;
    /** Definição do template executado. */
    template: ScaffoldTemplate<any, any>;
}

/**
 * Contexto fornecido para o gancho de finalização do processo.
 */
export interface FinishContext<Context> {
    /** Objeto de contexto final acumulado. */
    context: Context;
    /** Instância do gerenciador de pacotes selecionado. */
    packageManager: PackageManager;
    /** Exibe a mensagem de instrução pós-geração padrão. */
    finish(): void;
}

/**
 * Definição completa do contrato de um template de scaffolding.
 */
export interface ScaffoldTemplate<Context = ScaffoldContext, Config extends Partial<Context> = Context> {
    /** Nome amigável do template. */
    name?: string;
    /** Caminho absoluto do diretório do template. */
    folder: string;
    /** Banner visual exibido no início da execução. */
    banner?: string | ((context?: BannerContext<Config>) => Promise<void | string> | void | string);
    /** Etapa de configuração e perguntas interativas. */
    config?(context: Context): Promise<any>;
    /** Etapa de renderização dos arquivos de template. */
    render?(context: RenderContext<Config>): Promise<void>;
    /** Etapa personalizada de instalação de dependências. */
    install?(context: InstallContext<Config>): Promise<void>;
    /** Etapa final após a geração do projeto. */
    finish?(context: FinishContext<Config>): Promise<void>;
}

/**
 * Objeto de inicialização para definir um template de scaffolding.
 */
export interface ScaffoldTemplateInit<Context = ScaffoldContext, Config extends Partial<Context> = Context> {
    /** Nome amigável do template. */
    name?: string;
    /** Banner visual exibido no início da execução. */
    banner?: string | ((context?: BannerContext<Config>) => Promise<void | string> | void | string);
    /** Etapa de configuração e perguntas interativas. */
    config?(context: Context): Promise<any>;
    /** Etapa de renderização dos arquivos de template. */
    render?(context: RenderContext<Config>): Promise<void>;
    /** Etapa personalizada de instalação de dependências. */
    install?(context: InstallContext<Config>): Promise<void>;
    /** Etapa final após a geração do projeto. */
    finish?(context: FinishContext<Config>): Promise<void>;
}

/**
 * Função utilitária para definir um template de scaffolding com inferência estrita de tipos.
 * @param template - Objeto de configuração do template.
 * @returns O próprio objeto de template tipado.
 */
export function defineTemplate<const Template extends ScaffoldTemplateInit>(template: Template): Template {
    return template;
}

export {
    input,
    select,
    confirm,
    checkbox,
    password,
    expand,
    rawlist,
    editor,
    search
} from "./inquirer";

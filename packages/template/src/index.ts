import type { ChildProcess } from "node:child_process";

export interface Dependencies {
    dependencies: string[];
    devDependencies: string[];
}

export interface ScaffoldContext {
    folder: string;
    templateFolder: string;
    renderFolder: string;
    dependencies: Dependencies;
    [k: string]: unknown;
}

export interface PackageManager {
    install(): ChildProcess;
    add(dependencies: string[]): ChildProcess;
    addDev(dependencies: string[]): ChildProcess;
    getRunCommand(script: string): string;
}

export interface RenderContext<Context> {
    context: Context;
    render(input: string, output?: string): Promise<void>;
}

export interface InstallContext<Context> {
    context: Context;
    packageManager: PackageManager;
    install(): Promise<void>;
}

export interface BannerContext<Context> {
    context?: Context;
    template: ScaffoldTemplate<any, any>;
}

export interface FinishContext<Context> {
    context: Context;
    packageManager: PackageManager;
    finish(): void;
}

export interface ScaffoldTemplate<Context = ScaffoldContext, Config extends Partial<Context> = Context> {
    name?: string;
    folder: string;
    banner?: string | ((context?: BannerContext<Config>) => Promise<void | string> | void | string);
    config?(context: Context): Promise<any>;
    render?(context: RenderContext<Config>): Promise<void>;
    install?(context: InstallContext<Config>): Promise<void>;
    finish?(context: FinishContext<Config>): Promise<void>;
}

export interface ScaffoldTemplateInit<Context = ScaffoldContext, Config extends Partial<Context> = Context> {
    name?: string;
    banner?: string | ((context?: BannerContext<Config>) => Promise<void | string> | void | string);
    config?(context: Context): Promise<any>;
    render?(context: RenderContext<Config>): Promise<void>;
    install?(context: InstallContext<Config>): Promise<void>;
    finish?(context: FinishContext<Config>): Promise<void>;
}

export function defineTemplate<const Template extends ScaffoldTemplateInit>(template: Template): Template {
    return template;
}


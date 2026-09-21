import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/inquirer.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  platform: "node",
  target: "node18",
  skipNodeModulesBundle: true
});

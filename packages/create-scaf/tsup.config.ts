import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  platform: "node",
  target: "node18",
  skipNodeModulesBundle: true,
  banner: {
    js: "#!/usr/bin/env node"
  }
});

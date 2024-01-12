import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/executors/publish/executor.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
});

import { defineConfig } from "tsup";

const isDev = process.env.DEV === "true";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: !isDev,
  sourcemap: true,
  clean: !isDev,
  external: ["react", "react-dom"],
});

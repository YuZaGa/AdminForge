import { defineConfig } from "tsup";

const isDev = process.env.DEV === "true";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    next: "src/next.ts",
    security: "src/security/agent-auth.ts",
  },
  format: ["esm", "cjs"],
  dts: !isDev,
  sourcemap: true,
  clean: !isDev,
});

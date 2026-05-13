import { defineConfig } from "tsup";

const isDev = process.env.DEV === "true";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ui: "src/ui.ts",
    next: "src/next.ts",
    styles: "src/styles/adminforge.css",
  },

  format: ["esm", "cjs"],
  dts: !isDev,
  sourcemap: true,
  clean: !isDev,
  external: [
    "react",
    "react-dom",
    "next",
    "next-auth",
    "@prisma/client",
    "zod",
    "jsonwebtoken",
    "@tanstack/react-table",
    "@tiptap/core",
    "@tiptap/react",
    "@tiptap/starter-kit"
  ],
});

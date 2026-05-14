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
    "@tiptap/pm",
    "@tiptap/starter-kit",
    "@tiptap/extension-bubble-menu",
    "@tiptap/extension-floating-menu",
    "@tiptap/extension-highlight",
    "@tiptap/extension-horizontal-rule",
    "@tiptap/extension-image",
    "@tiptap/extension-link",
    "@tiptap/extension-placeholder",
    "@tiptap/extension-subscript",
    "@tiptap/extension-superscript",
    "@tiptap/extension-task-item",
    "@tiptap/extension-task-list",
    "@tiptap/extension-text-align",
    "@tiptap/extension-typography",
    "@tiptap/extension-underline",
  ],
});

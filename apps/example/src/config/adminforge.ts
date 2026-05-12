import { defineConfig, collection, fields } from "@adminforge/core";

export const config = defineConfig({
  collections: [
    collection({
      name: "posts",
      label: "Posts",
      icon: "article",
      access: { create: ["admin"], update: ["admin", "editor"], delete: ["admin"] },
      fields: {
        title: fields.text({ required: true }),
        slug: fields.slug({ from: "title", unique: true }),
        content: fields.richText(),
        published: fields.boolean({ default: false, access: { update: ["admin"] } }),
        coverImage: fields.image(),
        category: fields.relation({ to: "categories", type: "many-to-one", label: "Category" }),
        tags: fields.relation({ to: "tags", type: "many-to-many", label: "Tags" }),
      },
    }),
    collection({
      name: "categories",
      label: "Categories",
      icon: "category",
      access: { read: ["admin"] },
      fields: {
        name: fields.text({ required: true }),
      },
    }),
    collection({
      name: "tags",
      label: "Tags",
      icon: "sell",
      access: { read: ["admin", "editor"], create: ["admin"], update: ["admin"], delete: ["admin"] },
      fields: {
        name: fields.text({ required: true }),
      },
    }),
  ],
  auth: {
    enabled: true,
    roles: {
      admin: { label: "Administrator" },
      editor: { label: "Editor" },
    },
  },
});

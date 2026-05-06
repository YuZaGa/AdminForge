import { defineConfig, collection, fields } from "@adminforge/core";

export const config = defineConfig({
  collections: [
    collection({
      name: "posts",
      label: "Posts",
      fields: {
        title: fields.text({ required: true }),
        slug: fields.slug({ from: "title", unique: true }),
        content: fields.richText(),
        published: fields.boolean({ default: false }),
      },
      hooks: {
        beforeCreate: async ({ data }) => {
          if (!data.slug && data.title) {
            const title = data.title as string;
            data.slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          }
          return data;
        },
      },
    }),
    collection({
      name: "categories",
      fields: {
        name: fields.text({ required: true }),
      },
    }),
  ],
  auth: {
    enabled: true,
  },
});

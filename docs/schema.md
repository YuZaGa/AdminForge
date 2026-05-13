# Schema Reference

## defineConfig

The top-level configuration builder.

```ts
import { defineConfig, collection, fields } from "adminforge";

export const config = defineConfig({
  collections: [...],
  auth: { enabled: true, roles: {...} },
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collections` | `CollectionDefinition[]` | required | Array of collection definitions |
| `auth` | `AuthConfig` | `{ enabled: false }` | Authentication configuration |

## collection

Defines a database collection (table).

```ts
collection({
  name: "posts",
  label: "Blog Posts",
  icon: "article",
  fields: { ... },
  access: { create: ["admin"], read: ["admin", "editor"] },
  hooks: { beforeCreate: async ({ data }) => data },
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | required | Collection/table name (snake_case) |
| `label` | `string` | Capitalized name | Display label in UI |
| `icon` | `string` | `"database"` | Material Symbols icon name |
| `fields` | `Record<string, FieldDefinition>` | required | Field definitions |
| `access` | `AccessConfig` | all roles | Per-collection access control |
| `hooks` | `CollectionHooks` | — | Lifecycle hooks |

## Fields

### fields.text

```ts
fields.text({ required: true, label: "Title", unique: false, default: "" })
```

| Option | Type | Description |
|--------|------|-------------|
| `required` | `boolean` | Makes field mandatory |
| `unique` | `boolean` | Adds unique constraint |
| `label` | `string` | Display label |
| `default` | `any` | Default value |
| `hidden` | `boolean` | Hide from UI |
| `readOnly` | `boolean` | View-only in forms |
| `access` | `AccessConfig` | Per-field access control |

### fields.boolean

```ts
fields.boolean({ default: false })
```

### fields.richText

```ts
fields.richText({ required: true })
```

Renders a full-featured Tiptap editor with bold, italic, headings, lists, images, links, tables, and more.

### fields.slug

```ts
fields.slug({ from: "title", unique: true })
```

Auto-generates URL-safe slugs from another field. Has a `beforeSave` hook that lowercases and replaces spaces with hyphens.

| Option | Type | Description |
|--------|------|-------------|
| `from` | `string` | Source field name to derive slug from |
| `unique` | `boolean` | Enforces unique slugs (default: `true`) |

### fields.relation

```ts
fields.relation({ to: "categories", type: "many-to-one", label: "Category" })
```

| Option | Type | Description |
|--------|------|-------------|
| `to` | `string` | Target collection name |
| `type` | `"many-to-one"` \| `"one-to-many"` \| `"many-to-many"` | Relation cardinality |

### fields.date

```ts
fields.date({ autoCreate: true })
```

| Option | Type | Description |
|--------|------|-------------|
| `autoCreate` | `boolean` | Auto-fills current datetime on create |

### fields.image

```ts
fields.image({ label: "Cover Image" })
```

## Hooks

Hooks allow you to intercept CRUD operations at the collection level.

```ts
collection({
  name: "posts",
  fields: { ... },
  hooks: {
    beforeCreate: async ({ data }) => {
      data.createdBy = "system";
      return data;
    },
    afterCreate: async ({ data, id }) => {
      await logAudit("create", id);
    },
    beforeUpdate: async ({ data, id }) => data,
    afterUpdate: async ({ data, id }) => {},
    beforeDelete: async ({ id }) => {},
    afterDelete: async ({ id }) => {},
  },
});
```

### Field-Level Hooks

```ts
fields.text({
  hooks: {
    beforeValidate: (value) => value?.trim(),
    beforeSave: (value) => value?.toLowerCase(),
  },
});
```

## Custom Fields

You can register custom field types:

```ts
import { registerField, getField } from "adminforge";

registerField("markdown", {
  type: "markdown",
  db: { type: "String", nullable: true },
  ui: { component: "MarkdownEditor", props: {} },
  validation: z.string().optional(),
});
```

## Access Control

Access can be set at the collection or field level:

```ts
collection({
  name: "posts",
  access: {
    create: ["admin"],
    read: ["admin", "editor"],
    update: ["admin", "editor"],
    delete: ["admin"],
  },
  fields: {
    published: fields.boolean({
      access: { update: ["admin"] },
    }),
  },
});
```

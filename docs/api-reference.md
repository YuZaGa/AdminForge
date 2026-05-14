# API Reference

## Export Paths

| Import Path | Contents | Environment |
|-------------|----------|-------------|
| `@adminforge/core` | Core schema, fields, DB client | Node.js |
| `@adminforge/core/next` | API controller, route handlers, auth, agent tokens | Node.js |
| `@adminforge/core/ui` | Admin dashboard UI components | React (client) |
| `@adminforge/core/styles` | Admin dashboard stylesheet | CSS |

---

## @adminforge/core

### Schema Builders

```ts
import { defineConfig, collection, fields, type InferRecord } from "@adminforge/core";
```

- `defineConfig(config)` — Creates an `AdminForgeConfig` from collections and auth settings
- `collection(input)` — Creates a `CollectionDefinition` with name, label, fields, hooks, and access
- `fields` — Object with field builders: `text`, `boolean`, `richText`, `slug`, `relation`, `date`, `image`
- `type Record = InferRecord<typeof myCollection>` — Utility to infer the TypeScript type of a record

### Types

```ts
import type {
  AdminForgeConfig,
  CollectionDefinition,
  CollectionHooks,
  FieldDefinition,
  FieldOptions,
  AccessConfig,
  AuthConfig,
  TextOptions,
  BooleanOptions,
  RichTextOptions,
  SlugOptions,
  RelationOptions,
  DateOptions,
  ImageOptions,
  NormalizedSchema,
  FieldDBMapping,
  FieldUI,
  FieldHooks,
  FieldMeta,
} from "@adminforge/core";
```

### DB Client

```ts
import { createAdminForgeApi, verifyAgentToken } from "@adminforge/core/next";
import type { DbClient } from "@adminforge/core";

const db = createDbClient(config, existingPrismaClient?);

db.create(collectionName, data);
db.findMany(collectionName, { where, orderBy, skip, take });
db.findUnique(collectionName, id);
db.update(collectionName, id, data);
db.delete(collectionName, id);
db.count(collectionName, { where });
```

### Field Registry

```ts
import { registerField, getField, getRegisteredFields, clearRegistry } from "@adminforge/core";

registerField("customType", definition);
const field = getField("customType");
```

### Lifecycle Hooks

```ts
import {
  executeBeforeCreate,
  executeAfterCreate,
  executeBeforeUpdate,
  executeAfterUpdate,
  executeBeforeDelete,
  executeAfterDelete,
} from "@adminforge/core";
```

### Utilities

```ts
import { normalize } from "@adminforge/core";
// Normalizes config (fills defaults for labels, auth, etc.)
```

---

## @adminforge/core/next

### Next.js Helpers (`@adminforge/core/next`)

#### `createAdminForgeApi({ config, db })`

The easiest way to mount AdminForge. Creates catch-all route handlers for the App Router.
Returns: `{ GET, POST, PATCH, DELETE }`

#### `generateAgentToken(userId, role, scopes, expiresIn?)`

Creates a signed JWT for AI agents.

#### `verifyAgentToken(token)`

Verifies an AI agent JWT and returns the payload.

#### `createController(collection, db, securityContext)`

Low-level controller for manual API implementations.

### UI Entry Point (npm install @adminforge/core /ui`)

#### `AdminDashboard`

The primary React entry point. Handles internal routing and data fetching automatically.

- `config`: Your `AdminForgeConfig`
- `params`: The catch-all route params (from Next.js)

#### `AdminPage`

---

## @adminforge/core/ui

### Screens

```ts
import {
  AdminPage,              // Dashboard overview
  CollectionListPage,     // Collection data table with search/pagination
  CollectionFormPage,     // Create/edit form for a record
  CollectionSchemaPage,   // Schema viewer for a collection
  RolesListPage,          // Role management list
  RoleDetailPage,         // Role detail view
} from "@adminforge/core/ui";
```

### Components

```ts
import {
  AdminLayout,      // Sidebar + topbar layout wrapper
  FormEngine,       // Dynamic form renderer from collection definition
  TableEngine,      // Generic data table with sorting/pagination
  RichTextEditor,   // Full-featured Tiptap editor
  ImageUpload,      // Image upload component
} from "@adminforge/core/ui";
```

### Auth (Client)

```ts
import { AuthProvider, useAdminSession } from "@adminforge/core/ui";
```

- `AuthProvider` — React context provider wrapping the app
- `useAdminSession()` — Hook to access current session

---

## CLI Reference

### `adminforge` (Main CLI)

```bash
npx adminforge migrate           # Create and run migrations (dev)
npx adminforge migrate --push    # Sync DB directly (local dev)
npx adminforge migrate --deploy  # Apply migrations (production/Vercel)
npx adminforge makemigrations    # Create migration files without applying
```

### `adminforge-ai` (AI Extension)

```bash
npx adminforge-ai start          # Start MCP server
npx adminforge-ai token          # Generate agent token
```

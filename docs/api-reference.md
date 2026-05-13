# API Reference

## Export Paths

| Import Path | Contents | Environment |
|-------------|----------|-------------|
| `adminforge` | Core schema, fields, DB client | Node.js |
| `adminforge/next` | API controller, route handlers, auth, agent tokens | Node.js |
| `adminforge/ui` | Admin dashboard UI components | React (client) |
| `adminforge/styles` | Admin dashboard stylesheet | CSS |

---

## adminforge

### Schema Builders

```ts
import { defineConfig, collection, fields } from "adminforge";
```

- `defineConfig(config)` — Creates an `AdminForgeConfig` from collections and auth settings
- `collection(input)` — Creates a `CollectionDefinition` with name, label, fields, hooks, and access
- `fields` — Object with field builders: `text`, `boolean`, `richText`, `slug`, `relation`, `date`, `image`

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
} from "adminforge";
```

### DB Client

```ts
import { createDbClient } from "adminforge";
import type { DbClient } from "adminforge";

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
import { registerField, getField, getRegisteredFields, clearRegistry } from "adminforge";

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
} from "adminforge";
```

### Utilities

```ts
import { normalize } from "adminforge";
// Normalizes config (fills defaults for labels, auth, etc.)
```

---

## adminforge/next

### Route Handlers

```ts
import { createRouteHandlers } from "adminforge/next";

const { generateHandlers } = createRouteHandlers({ config, db });
const handlers = generateHandlers(collectionName);
// handlers.GET, handlers.POST, handlers.PATCH, handlers.DELETE
```

### Controller

```ts
import { createController } from "adminforge/next";
import type { Controller } from "adminforge/next";

const controller = createController(collection, db, securityContext);
controller.list({ page, pageSize, search });
controller.get(id);
controller.create(data);
controller.update(id, data);
controller.delete(id);
```

### Auth Utilities

```ts
import { createAuthConfig, auth, adminMiddleware } from "adminforge/next";
```

- `createAuthConfig(options)` — Creates an auth configuration object
- `auth` — Reference to the auth providers config
- `adminMiddleware(handler)` — Wraps a Next.js route handler with session-check middleware

### Agent Security

```ts
import {
  generateAgentToken,
  verifyAgentToken,
  assertScope,
} from "adminforge/next";
import type {
  SecurityContext,
  AgentTokenPayload,
  AgentSession,
  Action,
} from "adminforge/next";
```

- `generateAgentToken(userId, role, scopes, expiresIn?)` — Creates a signed JWT
- `verifyAgentToken(token)` — Verifies and decodes a JWT
- `assertScope(agent, collection, action)` — Throws if scope is not authorized

---

## adminforge/ui

### Screens

```ts
import {
  AdminPage,              // Dashboard overview
  CollectionListPage,     // Collection data table with search/pagination
  CollectionFormPage,     // Create/edit form for a record
  CollectionSchemaPage,   // Schema viewer for a collection
  RolesListPage,          // Role management list
  RoleDetailPage,         // Role detail view
} from "adminforge/ui";
```

### Components

```ts
import {
  AdminLayout,      // Sidebar + topbar layout wrapper
  FormEngine,       // Dynamic form renderer from collection definition
  TableEngine,      // Generic data table with sorting/pagination
  RichTextEditor,   // Full-featured Tiptap editor
  ImageUpload,      // Image upload component
} from "adminforge/ui";
```

### Auth (Client)

```ts
import { AuthProvider, useAdminSession } from "adminforge/ui";
```

- `AuthProvider` — React context provider wrapping the app
- `useAdminSession()` — Hook to access current session

---

## @adminforge/ai

### CLI

```bash
npx adminforge-ai start          # Start MCP server
npx adminforge-ai token          # Generate agent token
```

### Programmatic

```ts
import { defineAIHints, mergeHints } from "@adminforge/ai";
import type { AIHintsConfig, AIFieldHint, AICollectionHints } from "@adminforge/ai";
```

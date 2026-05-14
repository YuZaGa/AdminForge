# Quickstart

## Installation

```bash
npx create-next-app@latest my-admin --typescript
cd my-admin
npm install @adminforge/core @prisma/client next-auth
npm install --save-dev prisma tsx
```

> [!TIP]
> You don't need to run `npx prisma init`. AdminForge manages your schema and folder structure automatically.

## 1. Configure next.config.ts

Next.js needs to transpile the adminforge package (it contains JSX):

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@adminforge/core"],
};

export default nextConfig;
```

## 2. Define Your Schema

Create `adminforge.ts` in your project root:

```ts
import { defineConfig, collection, fields } from "@adminforge/core";

export const config = defineConfig({
  collections: [
    collection({
      name: "posts",
      label: "Blog Posts",
      icon: "article",
      fields: {
        title: fields.text({ required: true }),
        slug: fields.slug({ from: "title" }),
        content: fields.richText(),
        published: fields.boolean({ default: false }),
        category: fields.relation({ to: "categories", type: "many-to-one" }),
      },
    }),
    collection({
      name: "categories",
      label: "Categories",
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
```

## 3. Generate Prisma Schema & Migrate

AdminForge generates your database schema directly from your TypeScript config. To sync your database, run:

```bash
npx adminforge migrate --push
```

> [!IMPORTANT]
> Ensure your `DATABASE_URL` is set in your `.env` file. For SQLite, use `DATABASE_URL="file:./dev.db"`.

This command:
1.  **Generates** `prisma/schema.prisma` from your `adminforge.ts`.
2.  **Syncs** your database using `prisma db push` (perfect for local development).
3.  **Generates** the Prisma client so you can start querying data.

For production environments, you can use `npx adminforge migrate` (without `--push`) to create and run standard Prisma migrations.

## 4. Create Database Client

```ts
// lib/adminforge.ts
import { config } from "../adminforge";
import { createDbClient } from "@adminforge/core";

export function getConfig() {
  return config;
}

const db = createDbClient(config);
export function getDb() {
  return db;
}
```

## 5. Mount API Routes

Create a catch-all route at `app/api/[...slug]/route.ts`:

```ts
// app/api/[...slug]/route.ts
import { createAdminForgeApi } from "@adminforge/core/next";
import { getConfig, getDb } from "@/lib/adminforge";

const config = getConfig();
const db = getDb();

export const { GET, POST, PATCH, DELETE } = createAdminForgeApi({ config, db });
```

This single line handles all CRUD operations, searching, and security for every collection in your config.

## 6. Mount the Dashboard

```ts
// app/admin/layout.tsx
import { AdminForgeProvider } from "@adminforge/core/ui";
import "@adminforge/core/styles";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminForgeProvider>
          {children}
        </AdminForgeProvider>
      </body>
    </html>
  );
}
```

```ts
// app/admin/[[...admin]]/page.tsx
import { AdminDashboard } from "@adminforge/core/ui";

export default function Dashboard() {
  return <AdminDashboard />;
}
```

## 7. Run

```bash
npm run dev
```

Visit `http://localhost:3000/admin`.

---

## Looking for more control?

If you need to customize the API logic or use a different routing structure, check out the [Manual Setup & Custom Integration](./manual-setup.md) guide.

---

## CLI Reference

The `@adminforge/ai` package provides a CLI:

```bash
npx adminforge-ai start          # Start MCP server for AI agents
npx adminforge-ai token          # Generate scoped agent token
```

### `token` command

```bash
npx adminforge-ai token \
  --user my-agent \
  --role editor \
  --scopes "posts:create,posts:read,categories:read"
```

### `start` command

```bash
# Local mode (direct DB access)
npx adminforge-ai start --config ./adminforge.ts

# Remote proxy mode (points to running API)
npx adminforge-ai start --api-url http://localhost:3000 --token <AGENT_TOKEN>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Prisma database connection string |
| `NEXTAUTH_SECRET` | For auth | NextAuth signing secret |
| `NEXTAUTH_URL` | For auth | Your app's URL |
| `ADMINFORGE_SECRET` | For AI | Agent token signing key |

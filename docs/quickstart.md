# Quickstart

## Installation

```bash
npx create-next-app@latest my-admin --typescript
cd my-admin
npm install adminforge @prisma/client next-auth
npm install --save-dev prisma tsx
npx prisma init
```

## 1. Configure next.config.ts

Next.js needs to transpile the adminforge package (it contains JSX):

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["adminforge"],
};

export default nextConfig;
```

## 2. Define Your Schema

Create `adminforge.ts` in your project root:

```ts
import { defineConfig, collection, fields } from "adminforge";

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

Create `scripts/migrate.ts`:

```ts
import { generatePrismaSchema } from "adminforge";
import { config } from "../adminforge";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
const schema = generatePrismaSchema(config, { provider: "sqlite" });
writeFileSync(schemaPath, schema);
console.log("Generated Prisma schema at prisma/schema.prisma");

execSync("prisma generate", { stdio: "inherit" });

const args = process.argv.slice(2);
if (args.includes("--push")) {
  execSync("prisma db push", { stdio: "inherit" });
} else if (args.includes("--name")) {
  const name = args[args.indexOf("--name") + 1];
  execSync(`prisma migrate dev --name "${name}"`, { stdio: "inherit" });
} else {
  execSync("prisma migrate dev", { stdio: "inherit" });
}
```

Run it:

```bash
npx tsx scripts/migrate.ts --push
```

This generates `prisma/schema.prisma` from your `adminforge.ts` config, generates the Prisma client, and syncs the database. Iterate by editing `adminforge.ts` and re-running.

## 4. Create Database Client

```ts
// lib/adminforge.ts
import { config } from "../adminforge";
import { createDbClient } from "adminforge";

export function getConfig() {
  return config;
}

const db = createDbClient(config);
export function getDb() {
  return db;
}
```

## 5. Mount API Routes

```ts
// app/api/[...slug]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getConfig, getDb } from "@/lib/adminforge";
import { verifyAgentToken, type SecurityContext } from "adminforge/next";

async function getSecurity(request: NextRequest): Promise<SecurityContext> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const agent = verifyAgentToken(token);
      return { source: "agent", agent, user: { id: agent.sub, role: agent.role } };
    } catch {}
  }
  return { source: "user" };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [collectionName, id] = slug;
  const { createController } = await import("adminforge/next");
  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) return Response.json({ error: "Not found" }, { status: 404 });
  const db = getDb();
  const security = await getSecurity(request);
  const controller = createController(collection, db, security);
  if (id) {
    const result = await controller.get(id);
    return Response.json(result ?? { error: "Not found" }, { status: result ? 200 : 404 });
  }
  const url = new URL(request.url);
  const result = await controller.list({
    page: parseInt(url.searchParams.get("page") ?? "1"),
    pageSize: parseInt(url.searchParams.get("pageSize") ?? "10"),
    search: url.searchParams.get("search") ?? undefined,
  });
  return Response.json(result);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const { createController } = await import("adminforge/next");
  const config = getConfig();
  const collection = config.collections.find((c) => c.name === slug[0]);
  if (!collection) return Response.json({ error: "Not found" }, { status: 404 });
  const db = getDb();
  const security = await getSecurity(request);
  const controller = createController(collection, db, security);
  try {
    const result = await controller.create(await request.json());
    return Response.json(result, { status: 201 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}

// Add PATCH, DELETE similarly
```

## 6. Mount the Dashboard

```ts
// app/admin/layout.tsx
import type { Metadata } from "next";
import "adminforge/styles";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

```ts
// app/admin/page.tsx
"use client";
import { AdminPage } from "adminforge/ui";
import type { AdminForgeConfig } from "adminforge";

export default function Dashboard() {
  return <AdminPage config={config} role="admin" />;
}
```

## 7. Run

```bash
npm run dev
```

Visit `http://localhost:3000/admin`.

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

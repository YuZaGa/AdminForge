# Manual Setup & Custom Integration

This guide is for developers who want total control over the AdminForge integration or are using a framework other than Next.js App Router.

## 1. Manual API Handlers

If you don't want to use `createAdminForgeApi`, you can build your own handlers using `createRouteHandlers`. This is useful if you want to add custom middleware, logging, or transform data before it reaches the controller.

```ts
// app/api/admin/[...admin]/route.ts
import { NextRequest } from "next/server";
import { getConfig, getDb } from "@/lib/adminforge";
import { createRouteHandlers, verifyAgentToken, type SecurityContext } from "@adminforge/core/next";

async function getSecurity(request: Request): Promise<SecurityContext> {
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ admin: string[] }> }) {
  const { admin } = await params;
  const [collectionName, id] = admin;
  
  const config = getConfig();
  const db = getDb();
  const { generateHandlers } = createRouteHandlers({ config, db });
  
  const handlers = generateHandlers(collectionName);
  return handlers.GET(request, { params: Promise.resolve({ id: id || "" }) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ admin: string[] }> }) {
  const { admin } = await params;
  const { generateHandlers } = createRouteHandlers({ config: getConfig(), db: getDb() });
  const handlers = generateHandlers(admin[0]);
  return handlers.POST(request);
}
```

## 2. Manual UI Routing

Instead of `AdminDashboard`, you can import individual screens and build your own routing logic. This allows you to wrap specific pages in custom layouts or inject additional props.

```ts
import { 
  CollectionListPage, 
  CollectionFormPage, 
  CollectionSchemaPage 
} from "@adminforge/core/ui";

export default function MyCustomPage({ collection, data }) {
  return (
    <div className="my-wrapper">
      <CollectionListPage 
        config={config}
        collection={collection}
        data={data}
        total={100}
        page={1}
        pageSize={10}
      />
    </div>
  );
}
```

## 3. Low-Level Controller Access

For the most extreme customization (e.g., using AdminForge as a headless CMS engine), you can use the `createController` directly.

```ts
import { createController } from "@adminforge/core/next";

const controller = createController(collection, db, securityContext);

// Use it anywhere in your backend
const posts = await controller.list({ search: "hello" });
const newPost = await controller.create({ title: "Custom Create" });
```

## Why use Manual Setup?

- **Custom Middleware:** Add per-route rate limiting or specialized logging.
- **Data Transformation:** Intercept and modify payloads before they hit the database.
- **Different Frameworks:** Use the `controller` or `generateHandlers` logic inside Express, Hono, or Fastify.
- **Custom UI:** Replace the default `AdminLayout` with your own navigation or branding.

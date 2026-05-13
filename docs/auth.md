# Authentication & RBAC

## Setup

AdminForge uses NextAuth v5 for session-based authentication. First, configure auth in your schema:

```ts
// adminforge.ts
import { defineConfig, collection, fields } from "adminforge";

export const config = defineConfig({
  collections: [...],
  auth: {
    enabled: true,
    roles: {
      admin: { label: "Administrator" },
      editor: { label: "Editor" },
      viewer: { label: "Viewer" },
    },
  },
});
```

## Auth Configuration

```ts
interface AuthConfig {
  enabled: boolean;                    // Enable/disable auth
  provider?: "credentials";            // Auth provider (default: "credentials")
  roles?: Record<string, {             // Role definitions
    label?: string;
    parent?: string;                   // Future: role inheritance
  }>;
}
```

## NextAuth Setup

Create `lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const USERS: Record<string, { password: string; role: string }> = {
  admin: { password: process.env.ADMIN_PASSWORD ?? "admin123", role: "admin" },
  editor: { password: process.env.EDITOR_PASSWORD ?? "editor123", role: "editor" },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const userKey = email.split("@")[0];
        const user = USERS[userKey];
        if (user && password === user.password) {
          return { id: userKey, email, name: userKey, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) (token as any).role = (user as any).role;
      return token;
    },
    session: ({ session, token }) => {
      (session as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
});
```

## Access Control Model

Access is checked at three levels:

1. **Scope Enforcement** (AI Agents) — JWT token scopes limit which collections/actions an agent can perform
2. **Collection-Level RBAC** — Who can create/read/update/delete records in a collection
3. **Field-Level RBAC** — Who can read/update specific fields within a record

### Collection Access

```ts
collection({
  name: "posts",
  access: {
    create: ["admin"],
    read: ["admin", "editor"],    // empty or omitted = all roles
    update: ["admin", "editor"],
    delete: ["admin"],
  },
});
```

### Field Access

```ts
fields.boolean({
  access: {
    update: ["admin"],   // only admins can toggle this field
  },
});
```

## API Route Security

The generic API route handler (`app/api/[...slug]/route.ts`) supports both session-based and agent-token authentication automatically via the `SecurityContext`:

```ts
type SecurityContext = {
  user?: { id: string; role: string };
  agent?: AgentSession;
  source: "user" | "agent";
};
```

## Middleware

Protect admin routes with Next.js middleware:

```ts
// middleware.ts
export { adminMiddleware as default } from "adminforge/next";
```

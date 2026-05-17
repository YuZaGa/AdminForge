import type { AdminForgeConfig, CollectionDefinition } from "../core";
import type { DbClient } from "../db";
import { createController } from "./controller.js";
import { verifyAgentToken, type SecurityContext } from "./security/agent-auth.js";

interface RouteContext {
  params: Promise<Record<string, string>>;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getBody(request: Request): Promise<Record<string, unknown>> {
  return request.json().catch(() => ({}));
}

interface RouteParams {
  config: AdminForgeConfig;
  db: DbClient;
  auth?: any; // The NextAuth auth() function
}

export function createRouteHandlers({ config, db, auth }: RouteParams) {
  // We'll create controllers per request to inject the correct security context
  const getSecurity = async (request: Request): Promise<SecurityContext> => {
    const authHeader = request.headers.get("authorization");
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const agent = verifyAgentToken(token);
        return {
          source: "agent",
          agent,
          user: { id: agent.sub, role: agent.role } 
        };
      } catch (e: any) {
        console.error(`[Auth] Agent Verification Failed: ${e.message}`);
      }
    }

    // Try to get session via NextAuth if provided
    if (auth) {
      try {
        const session = await auth();
        if (session?.user) {
          return {
            source: "user",
            user: {
              id: session.user.id || session.user.email,
              role: (session as any).role || "user"
            }
          };
        }
      } catch (e: any) {
        console.error(`[Auth] Session Retrieval Failed: ${e.message}`);
      }
    }

    return { source: "user" }; 
  };

  function generateHandlers(collectionName: string) {
    const collection = config.collections.find((c) => c.name === collectionName);
    if (!collection) {
      throw new Error(`Collection "${collectionName}" not found in config`);
    }

    return {
      GET: async (request: Request, context: RouteContext) => {
        const security = await getSecurity(request);
        const controller = createController(collection, db, security);
        const params = await context.params;
        if (params.id) {
          const result = await controller.get(params.id);
          if (!result) return jsonResponse({ error: "Not found" }, 404);
          return jsonResponse(result);
        }
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") ?? "1");
        const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
        const search = url.searchParams.get("search") ?? undefined;
        const result = await controller.list({ page, pageSize, search });
        return jsonResponse(result);
      },

      POST: async (request: Request) => {
        const security = await getSecurity(request);
        const controller = createController(collection, db, security);
        const body = await getBody(request);
        try {
          const result = await controller.create(body);
          return jsonResponse(result, 201);
        } catch (err) {
          const error = err as any;
          if (error.name === "ZodError") {
            const issues = error.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join(", ");
            return jsonResponse({ error: `Validation failed: ${issues}` }, 400);
          }
          return jsonResponse({ error: error.message }, 400);
        }
      },

      PATCH: async (request: Request, context: RouteContext) => {
        const security = await getSecurity(request);
        const controller = createController(collection, db, security);
        const params = await context.params;
        if (!params.id) return jsonResponse({ error: "ID required" }, 400);
        const body = await getBody(request);
        try {
          const result = await controller.update(params.id, body);
          return jsonResponse(result);
        } catch (err) {
          const error = err as any;
          if (error.name === "ZodError") {
            const issues = error.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join(", ");
            return jsonResponse({ error: `Validation failed: ${issues}` }, 400);
          }
          return jsonResponse({ error: error.message }, 400);
        }
      },

      DELETE: async (request: Request, context: RouteContext) => {
        const security = await getSecurity(request);
        const controller = createController(collection, db, security);
        const params = await context.params;
        if (!params.id) return jsonResponse({ error: "ID required" }, 400);
        try {
          const result = await controller.delete(params.id);
          return jsonResponse(result);
        } catch (err) {
          const error = err as Error;
          return jsonResponse({ error: error.message }, 400);
        }
      },
    };
  }

  return { generateHandlers };
}

export function createAdminForgeApi({ config, db, auth }: RouteParams) {
  const { generateHandlers } = createRouteHandlers({ config, db, auth });

  const getCollectionAndId = (slug: string[]) => {
    const [collectionName, id] = slug;
    const handlers = generateHandlers(collectionName);
    return { handlers, id };
  };

  return {
    async GET(request: Request, { params }: { params: Promise<any> }) {
      try {
        const resolvedParams = await params;
        const slug = resolvedParams.slug || resolvedParams.admin || Object.values(resolvedParams)[0] as string[];
        
        // Return serialized config for the UI
        // Detect _config anywhere in the slug to support various mounting points
        if (slug.includes("_config")) {
          if (config.auth?.enabled && auth) {
            try {
              const session = await auth();
              if (!session?.user) {
                return jsonResponse({ error: "Unauthorized" }, 401);
              }
            } catch {
              return jsonResponse({ error: "Unauthorized" }, 401);
            }
          }
          const { serializeConfig } = await import("../core/index.js");
          return jsonResponse(serializeConfig(config));
        }

        const { handlers, id } = getCollectionAndId(slug);
        return handlers.GET(request, { params: Promise.resolve({ id: id || "" }) });
      } catch (err) {
        return jsonResponse({ error: (err as Error).message }, 404);
      }
    },

    async POST(request: Request, { params }: { params: Promise<any> }) {
      try {
        const resolvedParams = await params;
        const slug = resolvedParams.slug || resolvedParams.admin || Object.values(resolvedParams)[0] as string[];
        
        // Handle Media Uploads
        if (slug[0] === "_media") {
          const formData = await request.formData();
          const file = formData.get("file") as File;
          if (!file) return jsonResponse({ error: "No file uploaded" }, 400);

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const path = await import("path");
          const fs = await import("fs/promises");
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          
          try {
            await fs.mkdir(uploadDir, { recursive: true });
          } catch {}

          const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, buffer);

          return jsonResponse({ 
            url: `/uploads/${filename}`,
            filename
          }, 201);
        }

        // Handle Agent Token Generation
        if (slug[0] === "_tokens") {
          const { generateAgentToken } = await import("./security/agent-auth.js");
          const body = await request.json();
          const { scope, expiresIn = 600 } = body;

          if (!Array.isArray(scope)) {
            return jsonResponse({ error: "Scope must be an array" }, 400);
          }

          // Validation: Ensure collections exist
          for (const s of scope) {
            const [collection, action] = s.split(":");
            const exists = config.collections.find(c => c.name === collection);
            if (!exists) return jsonResponse({ error: `Invalid collection: ${collection}` }, 400);
            if (!["create", "read", "update", "delete"].includes(action)) {
              return jsonResponse({ error: `Invalid action: ${action}` }, 400);
            }
          }

          // Auth: Get session
          let userId = "admin";
          let role = "admin";
          if (auth) {
            const session = await auth();
            if (session?.user) {
              userId = session.user.id || session.user.email;
              role = (session as any).role || "admin";
            }
          }

          const token = generateAgentToken(userId, role, scope, expiresIn);
          return jsonResponse({ token });
        }

        const { handlers } = getCollectionAndId(slug);
        return handlers.POST(request);
      } catch (err) {
        return jsonResponse({ error: (err as Error).message }, 404);
      }
    },

    async PATCH(request: Request, { params }: { params: Promise<any> }) {
      try {
        const resolvedParams = await params;
        const slug = resolvedParams.slug || resolvedParams.admin || Object.values(resolvedParams)[0] as string[];
        const { handlers, id } = getCollectionAndId(slug);
        return handlers.PATCH(request, { params: Promise.resolve({ id: id || "" }) });
      } catch (err) {
        return jsonResponse({ error: (err as Error).message }, 404);
      }
    },

    async DELETE(request: Request, { params }: { params: Promise<any> }) {
      try {
        const resolvedParams = await params;
        const slug = resolvedParams.slug || resolvedParams.admin || Object.values(resolvedParams)[0] as string[];
        const { handlers, id } = getCollectionAndId(slug);
        return handlers.DELETE(request, { params: Promise.resolve({ id: id || "" }) });
      } catch (err) {
        return jsonResponse({ error: (err as Error).message }, 404);
      }
    },
  };
}

import type { AdminForgeConfig, CollectionDefinition } from "@adminforge/core";
import type { DbClient } from "@adminforge/db";
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
}

export function createRouteHandlers({ config, db }: RouteParams) {
  // We'll create controllers per request to inject the correct security context
  const getSecurity = (request: Request): SecurityContext => {
    const authHeader = request.headers.get("authorization");
    console.log(`[Auth] Header present: ${!!authHeader}`);
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      console.log(`[Auth] Token detected (start): ${token.substring(0, 10)}...`);
      try {
        const agent = verifyAgentToken(token);
        return {
          source: "agent",
          agent,
          user: { id: agent.sub, role: agent.role } // Bridge for RBAC
        };
      } catch (e: any) {
        console.error(`[Auth] Agent Verification Failed: ${e.message}`);
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
        const security = getSecurity(request);
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
        const security = getSecurity(request);
        const controller = createController(collection, db, security);
        const body = await getBody(request);
        try {
          const result = await controller.create(body);
          return jsonResponse(result, 201);
        } catch (err) {
          const error = err as Error;
          return jsonResponse({ error: error.message }, 400);
        }
      },

      PATCH: async (request: Request, context: RouteContext) => {
        const security = getSecurity(request);
        const controller = createController(collection, db, security);
        const params = await context.params;
        if (!params.id) return jsonResponse({ error: "ID required" }, 400);
        const body = await getBody(request);
        try {
          const result = await controller.update(params.id, body);
          return jsonResponse(result);
        } catch (err) {
          const error = err as Error;
          return jsonResponse({ error: error.message }, 400);
        }
      },

      DELETE: async (request: Request, context: RouteContext) => {
        const security = getSecurity(request);
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

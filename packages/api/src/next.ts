import type { AdminForgeConfig, CollectionDefinition } from "@adminforge/core";
import type { DbClient } from "@adminforge/db";
import { createController } from "./controller.js";

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
  const controllerMap = new Map<string, ReturnType<typeof createController>>();
  for (const collection of config.collections) {
    controllerMap.set(collection.name, createController(collection, db));
  }

  function generateHandlers(collectionName: string) {
    const collection = config.collections.find((c) => c.name === collectionName);
    if (!collection) {
      throw new Error(`Collection "${collectionName}" not found in config`);
    }
    const controller = controllerMap.get(collectionName)!;

    return {
      GET: async (request: Request, context: RouteContext) => {
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

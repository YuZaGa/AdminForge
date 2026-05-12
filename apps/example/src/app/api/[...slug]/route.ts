import { NextRequest } from "next/server";
import { z } from "zod";
import { getConfig, getDb } from "../../../lib/adminforge";
import { verifyAgentToken, type SecurityContext } from "@adminforge/api/security";

async function getSecurity(request: NextRequest): Promise<SecurityContext> {
  // 1. Check for Agent Token
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

  // 2. Check for User Session (Fallback for browser)
  const cookie = request.headers.get("cookie") ?? "";
  const hasSession = cookie.includes("authjs.session-token") || cookie.includes("next-auth.session-token");
  
  if (hasSession) {
    return { 
      source: "user", 
      user: { id: "unknown", role: "admin" } // Simplified for this example route
    };
  }

  return { source: "user" };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const { slug } = await params;
  const segments = Array.isArray(slug) ? slug : [slug];
  const [collectionName, id] = segments;

  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) {
    return Response.json({ error: `Collection "${collectionName}" not found` }, { status: 404 });
  }

  const db = getDb();
  const security = await getSecurity(request);

  if (id) {
    const result = await db.findUnique(collectionName, id);
    if (!result) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(result);
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (search) {
    const searchFields = Object.entries(collection.fields)
      .filter(([_, field]) => field.type === "text" || field.type === "slug" || field.type === "richText")
      .map(([name]) => name);

    if (searchFields.length > 0) {
      where.OR = searchFields.map(field => ({
        [field]: { contains: search }
      }));
    }
  }

  const [data, total] = await Promise.all([
    db.findMany(collectionName, { 
      where, 
      skip: (page - 1) * pageSize, 
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    db.count(collectionName, { where })
  ]);

  return Response.json({ data, total, page, pageSize });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const { slug } = await params;
  const segments = Array.isArray(slug) ? slug : [slug];
  const [collectionName] = segments;

  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const db = getDb();
  const security = await getSecurity(request);

  try {
    const { createController } = await import("@adminforge/api");
    const controller = createController(collection, db, security);
    const result = await controller.create(body);
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({
        error: "Validation failed",
        fields: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      }, { status: 400 });
    }
    const error = err as Error;
    if (error.message.startsWith("Access denied") || error.message.startsWith("Forbidden")) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const { slug } = await params;
  const segments = Array.isArray(slug) ? slug : [slug];
  const [collectionName, id] = segments;
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const db = getDb();
  const security = await getSecurity(request);

  try {
    const { createController } = await import("@adminforge/api");
    const controller = createController(collection, db, security);
    const result = await controller.update(id, body);
    return Response.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({
        error: "Validation failed",
        fields: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      }, { status: 400 });
    }
    const error = err as Error;
    if (error.message.startsWith("Access denied") || error.message.startsWith("Forbidden")) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> }
) {
  const { slug } = await params;
  const segments = Array.isArray(slug) ? slug : [slug];
  const [collectionName, id] = segments;
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });

  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) return Response.json({ error: "Not found" }, { status: 404 });

  const db = getDb();
  const security = await getSecurity(request);

  try {
    const { createController } = await import("@adminforge/api");
    const controller = createController(collection, db, security);
    await controller.delete(id);
    return Response.json({ success: true });
  } catch (err) {
    const error = err as Error;
    if (error.message.startsWith("Access denied") || error.message.startsWith("Forbidden")) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 400 });
  }
}

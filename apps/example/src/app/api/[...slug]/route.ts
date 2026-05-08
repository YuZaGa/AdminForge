import { NextRequest } from "next/server";
import { z } from "zod";
import { getConfig, getDb } from "../../../lib/adminforge";

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

  if (id) {
    const result = await db.findUnique(collectionName, id);
    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(result);
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "50");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (search) {
    where.search = search;
  }

  const data = await db.findMany(collectionName, { where, skip: (page - 1) * pageSize, take: pageSize });
  return Response.json({ data, total: data.length, page, pageSize });
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
  if (!collection) {
    return Response.json({ error: `Collection "${collectionName}" not found` }, { status: 404 });
  }

  const body = await request.json();
  const db = getDb();

  try {
    const result = await db.create(collectionName, body);
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({
        error: "Validation failed",
        fields: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      }, { status: 400 });
    }
    const error = err as Error;
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

  if (!id) {
    return Response.json({ error: "ID required" }, { status: 400 });
  }

  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) {
    return Response.json({ error: `Collection "${collectionName}" not found` }, { status: 404 });
  }

  const body = await request.json();
  const db = getDb();

  try {
    const result = await db.update(collectionName, id, body);
    return Response.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({
        error: "Validation failed",
        fields: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      }, { status: 400 });
    }
    const error = err as Error;
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

  if (!id) {
    return Response.json({ error: "ID required" }, { status: 400 });
  }

  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);
  if (!collection) {
    return Response.json({ error: `Collection "${collectionName}" not found` }, { status: 404 });
  }

  const db = getDb();

  try {
    await db.delete(collectionName, id);
    return Response.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return Response.json({ error: error.message }, { status: 400 });
  }
}

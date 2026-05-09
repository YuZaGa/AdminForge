import type { AdminForgeConfig, CollectionDefinition, AccessConfig } from "@adminforge/core";
import type { DbClient } from "@adminforge/db";
import { z } from "zod";

function buildValidationSchema(collection: CollectionDefinition): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [name, field] of Object.entries(collection.fields)) {
    shape[name] = field.validation;
  }
  return z.object(shape);
}

function hasAccess(access: AccessConfig | undefined, operation: string, role?: string): boolean {
  if (!access) return true;
  const allowed = access[operation as keyof AccessConfig];
  if (!allowed || !Array.isArray(allowed)) return true;
  if (!role) return false;
  return allowed.includes(role);
}

export interface AccessInfo {
  role?: string;
}

export interface Controller {
  list: (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; page?: number; pageSize?: number }) => Promise<{ data: unknown[]; total: number; page: number; pageSize: number }>;
  get: (id: string) => Promise<unknown | null>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
}

export function createController(
  collection: CollectionDefinition,
  db: DbClient,
  session?: AccessInfo,
): Controller {
  const validationSchema = buildValidationSchema(collection);
  const role = session?.role;

  function requireAccess(operation: "read" | "create" | "update" | "delete") {
    if (!hasAccess(collection.access, operation, role)) {
      throw new Error(`Access denied: ${operation} on ${collection.name}`);
    }
  }

  function filterFields(fields: Record<string, unknown>): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      const field = collection.fields[key];
      if (hasAccess(field?.access, "read", role)) {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  function filterWritableFields(
    fields: Record<string, unknown>,
    operation: "create" | "update"
  ): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      const field = collection.fields[key];
      if (field && hasAccess(field.access, operation, role)) {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  function applyFieldHooks(
    fields: Record<string, unknown>,
    hookName: "beforeValidate" | "beforeSave"
  ): Record<string, unknown> {
    const next = { ...fields };
    for (const [key, value] of Object.entries(next)) {
      const hook = collection.fields[key]?.hooks?.[hookName];
      if (hook) {
        next[key] = hook(value);
      }
    }
    return next;
  }

  function applyDerivedFields(fields: Record<string, unknown>): Record<string, unknown> {
    const next = { ...fields };
    for (const [name, field] of Object.entries(collection.fields)) {
      if (field.type !== "slug") continue;
      const current = next[name];
      if (typeof current === "string" && current.trim().length > 0) continue;
      const from = field.ui.props?.from;
      if (typeof from !== "string") continue;
      const source = next[from];
      if (typeof source !== "string" || source.trim().length === 0) continue;
      next[name] = source.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    return next;
  }

  return {
    async list(args = {}) {
      requireAccess("read");
      const { where, orderBy, page = 1, pageSize = 50 } = args;
      const skip = (page - 1) * pageSize;
      const raw = await db.findMany(collection.name, { where, orderBy, skip, take: pageSize });
      const data = (raw as Record<string, unknown>[]).map(filterFields);
      return { data, total: data.length, page, pageSize };
    },

    async get(id: string) {
      requireAccess("read");
      const raw = await db.findUnique(collection.name, id);
      if (!raw) return null;
      return filterFields(raw as Record<string, unknown>);
    },

    async create(data: Record<string, unknown>) {
      requireAccess("create");
      const allowed = filterWritableFields(data, "create");
      const withDerived = applyDerivedFields(allowed);
      const beforeValidate = applyFieldHooks(withDerived, "beforeValidate");
      const parsed = validationSchema.parse(beforeValidate);
      const beforeSave = applyFieldHooks(parsed, "beforeSave");
      const transformed = transformRelations(beforeSave, false);
      return db.create(collection.name, transformed);
    },

    async update(id: string, data: Record<string, unknown>) {
      requireAccess("update");
      const allowed = filterWritableFields(data, "update");
      const beforeValidate = applyFieldHooks(allowed, "beforeValidate");
      const parsed = validationSchema.partial().parse(beforeValidate);
      const beforeSave = applyFieldHooks(parsed, "beforeSave");
      const transformed = transformRelations(beforeSave, true);
      return db.update(collection.name, id, transformed);
    },

    async delete(id: string) {
      requireAccess("delete");
      return db.delete(collection.name, id);
    },
  };

  function transformRelations(data: Record<string, unknown>, isUpdate: boolean) {
    const transformed = { ...data };
    for (const [key, value] of Object.entries(transformed)) {
      const field = collection.fields[key];
      if (field?.type === "relation") {
        const relationType = field.db.relationType ?? "many-to-one";
        const isMulti = relationType === "many-to-many" || relationType === "one-to-many";

        if (Array.isArray(value)) {
          const ids = value.filter((id): id is string => typeof id === "string" && id.length > 0);
          transformed[key] = isUpdate
            ? { set: ids.map((id) => ({ id })) }
            : { connect: ids.map((id) => ({ id })) };
        } else if (!isMulti && typeof value === "string" && value.length > 0) {
          transformed[key] = { connect: { id: value } };
        } else if ((value === null || value === "") && isUpdate) {
          transformed[key] = { disconnect: true };
        } else if (value === null || value === "") {
          delete transformed[key];
        }
      }
    }
    return transformed;
  }
}

import type { AdminForgeConfig, CollectionDefinition } from "@adminforge/core";
import type { DbClient } from "@adminforge/db";
import { z } from "zod";

function buildValidationSchema(collection: CollectionDefinition): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [name, field] of Object.entries(collection.fields)) {
    shape[name] = field.validation;
  }
  return z.object(shape);
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
): Controller {
  const validationSchema = buildValidationSchema(collection);

  return {
    async list(args = {}) {
      const { where, orderBy, page = 1, pageSize = 50 } = args;
      const skip = (page - 1) * pageSize;
      const data = await db.findMany(collection.name, {
        where,
        orderBy,
        skip,
        take: pageSize,
      });
      return { data, total: data.length, page, pageSize };
    },

    async get(id: string) {
      return db.findUnique(collection.name, id);
    },

    async create(data: Record<string, unknown>) {
      const parsed = validationSchema.parse(data);
      const transformed = transformRelations(parsed, false);
      return db.create(collection.name, transformed);
    },

    async update(id: string, data: Record<string, unknown>) {
      const parsed = validationSchema.partial().parse(data);
      const transformed = transformRelations(parsed, true);
      return db.update(collection.name, id, transformed);
    },

    async delete(id: string) {
      return db.delete(collection.name, id);
    },
  };

  function transformRelations(data: Record<string, unknown>, isUpdate: boolean) {
    const transformed = { ...data };
    for (const [key, value] of Object.entries(transformed)) {
      const field = collection.fields[key];
      if (field?.type === "relation") {
        if (Array.isArray(value)) {
          if (isUpdate) {
            transformed[key] = { set: value.map((id: string) => ({ id })) };
          } else {
            transformed[key] = { connect: value.map((id: string) => ({ id })) };
          }
        } else if (typeof value === "string") {
          transformed[key] = { connect: { id: value } };
        } else if (value === null) {
          transformed[key] = { disconnect: true };
        }
      }
    }
    return transformed;
  }
}

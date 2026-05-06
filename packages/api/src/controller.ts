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
      return db.create(collection.name, parsed);
    },

    async update(id: string, data: Record<string, unknown>) {
      const parsed = validationSchema.partial().parse(data);
      return db.update(collection.name, id, parsed);
    },

    async delete(id: string) {
      return db.delete(collection.name, id);
    },
  };
}

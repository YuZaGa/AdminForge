import { PrismaClient } from "@prisma/client";
import type { AdminForgeConfig, CollectionDefinition, CollectionHooks } from "@adminforge/core";
import {
  executeBeforeCreate,
  executeAfterCreate,
  executeBeforeUpdate,
  executeAfterUpdate,
  executeBeforeDelete,
  executeAfterDelete,
} from "@adminforge/core";

export interface DbClient {
  create(collection: string, data: Record<string, unknown>): Promise<unknown>;
  findMany(collection: string, args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; skip?: number; take?: number }): Promise<unknown[]>;
  findUnique(collection: string, id: string): Promise<unknown | null>;
  update(collection: string, id: string, data: Record<string, unknown>): Promise<unknown>;
  delete(collection: string, id: string): Promise<unknown>;
}

export function createDbClient(config: AdminForgeConfig): DbClient {
  const prisma = new PrismaClient();
  const collectionMap = new Map<string, CollectionDefinition>();
  const hookMap = new Map<string, CollectionHooks | undefined>();

  for (const collection of config.collections) {
    collectionMap.set(collection.name, collection);
    hookMap.set(collection.name, collection.hooks);
  }

  const getPrismaModel = (collection: string) => {
    const model = (prisma as unknown as Record<string, unknown>)[collection];
    if (!model || typeof model !== "object") {
      throw new Error(`Collection "${collection}" not found in Prisma schema`);
    }
    return model as {
      create: (args: { data: Record<string, unknown>; include?: Record<string, boolean> }) => Promise<unknown>;
      findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
      findUnique: (args: { where: { id: string }; include?: Record<string, boolean> }) => Promise<unknown | null>;
      update: (args: { where: { id: string }; data: Record<string, unknown>; include?: Record<string, boolean> }) => Promise<unknown>;
      delete: (args: { where: { id: string } }) => Promise<unknown>;
    };
  };

  // Build include map for collections with relation fields
  const getIncludeMap = (collectionName: string): Record<string, boolean> | undefined => {
    const collDef = collectionMap.get(collectionName);
    if (!collDef) return undefined;
    const include: Record<string, boolean> = {};
    let hasRelations = false;
    for (const [fieldName, field] of Object.entries(collDef.fields)) {
      if (field.type === "relation") {
        include[fieldName] = true;
        hasRelations = true;
      }
    }
    return hasRelations ? include : undefined;
  };

  // Transform relation fields from raw IDs/arrays into Prisma connect/set syntax
  const transformRelations = (collectionName: string, data: Record<string, unknown>, isUpdate: boolean): Record<string, unknown> => {
    const collDef = collectionMap.get(collectionName);
    if (!collDef) return data;
    const transformed = { ...data };
    for (const [key, value] of Object.entries(transformed)) {
      const field = collDef.fields[key];
      if (field?.type === "relation") {
        if (Array.isArray(value)) {
          // Many-to-many or one-to-many: array of IDs
          if (isUpdate) {
            transformed[key] = { set: value.map((id: string) => ({ id })) };
          } else {
            transformed[key] = { connect: value.map((id: string) => ({ id })) };
          }
        } else if (typeof value === "string" && value !== "") {
          // Many-to-one: single ID string
          transformed[key] = { connect: { id: value } };
          // Remove the raw field and set the FK field instead for many-to-one
          // Actually Prisma accepts both connect syntax and raw FK, but connect is cleaner
        } else if (value === null || value === "") {
          transformed[key] = { disconnect: true };
        }
      }
    }
    return transformed;
  };

  return {
    async create(collection: string, data: Record<string, unknown>): Promise<unknown> {
      const hooks = hookMap.get(collection);
      const processedData = await executeBeforeCreate(hooks, data);
      const prismaData = transformRelations(collection, processedData, false);
      const model = getPrismaModel(collection);
      const include = getIncludeMap(collection);
      const result = await model.create({ data: prismaData, ...(include ? { include } : {}) });
      const resultId = (result as { id: string }).id;
      await executeAfterCreate(hooks, processedData, resultId);
      return result;
    },

    async findMany(collection: string, args: Record<string, unknown> = {}): Promise<unknown[]> {
      const model = getPrismaModel(collection);
      const include = getIncludeMap(collection);
      return model.findMany({ ...args, ...(include ? { include } : {}) });
    },

    async findUnique(collection: string, id: string): Promise<unknown | null> {
      const model = getPrismaModel(collection);
      const include = getIncludeMap(collection);
      return model.findUnique({ where: { id }, ...(include ? { include } : {}) });
    },

    async update(collection: string, id: string, data: Record<string, unknown>): Promise<unknown> {
      const hooks = hookMap.get(collection);
      const processedData = await executeBeforeUpdate(hooks, data, id);
      const prismaData = transformRelations(collection, processedData, true);
      const model = getPrismaModel(collection);
      const include = getIncludeMap(collection);
      const result = await model.update({ where: { id }, data: prismaData, ...(include ? { include } : {}) });
      await executeAfterUpdate(hooks, processedData, id);
      return result;
    },

    async delete(collection: string, id: string): Promise<unknown> {
      const hooks = hookMap.get(collection);
      await executeBeforeDelete(hooks, id);
      const model = getPrismaModel(collection);
      const result = await model.delete({ where: { id } });
      await executeAfterDelete(hooks, id);
      return result;
    },
  };
}

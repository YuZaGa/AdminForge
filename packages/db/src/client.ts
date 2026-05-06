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
      create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
      findMany: (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; skip?: number; take?: number }) => Promise<unknown[]>;
      findUnique: (args: { where: { id: string } }) => Promise<unknown | null>;
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
      delete: (args: { where: { id: string } }) => Promise<unknown>;
    };
  };

  return {
    async create(collection: string, data: Record<string, unknown>): Promise<unknown> {
      const hooks = hookMap.get(collection);
      const processedData = await executeBeforeCreate(hooks, data);
      const model = getPrismaModel(collection);
      const result = await model.create({ data: processedData });
      const resultId = (result as { id: string }).id;
      await executeAfterCreate(hooks, processedData, resultId);
      return result;
    },

    async findMany(collection: string, args = {}): Promise<unknown[]> {
      const model = getPrismaModel(collection);
      return model.findMany(args);
    },

    async findUnique(collection: string, id: string): Promise<unknown | null> {
      const model = getPrismaModel(collection);
      return model.findUnique({ where: { id } });
    },

    async update(collection: string, id: string, data: Record<string, unknown>): Promise<unknown> {
      const hooks = hookMap.get(collection);
      const processedData = await executeBeforeUpdate(hooks, data, id);
      const model = getPrismaModel(collection);
      const result = await model.update({ where: { id }, data: processedData });
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

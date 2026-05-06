import type { CollectionHooks } from "../types/index.js";

export async function executeBeforeCreate(
  hooks: CollectionHooks | undefined,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (hooks?.beforeCreate) {
    return await hooks.beforeCreate({ data });
  }
  return data;
}

export async function executeAfterCreate(
  hooks: CollectionHooks | undefined,
  data: Record<string, unknown>,
  id: string
): Promise<void> {
  if (hooks?.afterCreate) {
    await hooks.afterCreate({ data, id });
  }
}

export async function executeBeforeUpdate(
  hooks: CollectionHooks | undefined,
  data: Record<string, unknown>,
  id: string
): Promise<Record<string, unknown>> {
  if (hooks?.beforeUpdate) {
    return await hooks.beforeUpdate({ data, id });
  }
  return data;
}

export async function executeAfterUpdate(
  hooks: CollectionHooks | undefined,
  data: Record<string, unknown>,
  id: string
): Promise<void> {
  if (hooks?.afterUpdate) {
    await hooks.afterUpdate({ data, id });
  }
}

export async function executeBeforeDelete(
  hooks: CollectionHooks | undefined,
  id: string
): Promise<void> {
  if (hooks?.beforeDelete) {
    await hooks.beforeDelete({ id });
  }
}

export async function executeAfterDelete(
  hooks: CollectionHooks | undefined,
  id: string
): Promise<void> {
  if (hooks?.afterDelete) {
    await hooks.afterDelete({ id });
  }
}

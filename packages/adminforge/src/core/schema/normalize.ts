import type { AdminForgeConfig } from "../types/index.js";

export type NormalizedSchema = AdminForgeConfig;

export function normalize(config: AdminForgeConfig): NormalizedSchema {
  return {
    collections: config.collections.map((c) => ({
      ...c,
      label: c.label ?? c.name.charAt(0).toUpperCase() + c.name.slice(1),
    })),
    auth: config.auth ?? { enabled: false },
  };
}

/**
 * Removes non-serializable parts of the config (like Zod schemas)
 * so it can be passed from Server Components to Client Components.
 */
export function serializeConfig(config: AdminForgeConfig): any {
  return {
    ...config,
    collections: config.collections.map((c) => ({
      ...c,
      fields: Object.fromEntries(
        Object.entries(c.fields).map(([name, field]) => {
          const { validation, ...rest } = field;
          return [name, rest];
        })
      ),
    })),
  };
}

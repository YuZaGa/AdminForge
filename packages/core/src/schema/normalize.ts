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

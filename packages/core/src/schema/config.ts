import type { AdminForgeConfig, CollectionDefinition } from "../types/index.js";

export function defineConfig(config: {
  collections: CollectionDefinition[];
  auth?: { enabled: boolean };
}): AdminForgeConfig {
  return {
    collections: config.collections,
    auth: config.auth ?? { enabled: false },
  };
}

import type { AdminForgeConfig, CollectionDefinition, AuthConfig } from "../types/index.js";

export function defineConfig(config: {
  collections: CollectionDefinition[];
  auth?: AuthConfig;
}): AdminForgeConfig {
  return {
    collections: config.collections,
    auth: config.auth ?? { enabled: false },
  };
}

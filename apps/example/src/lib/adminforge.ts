import { config } from "../config/adminforge";
import { createDbClient } from "adminforge";

export function getConfig() {
  return config;
}

let db: ReturnType<typeof createDbClient> | null = null;

export function getDb() {
  if (!db) {
    db = createDbClient(config);
  }
  return db;
}

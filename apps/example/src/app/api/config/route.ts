import { config } from "../../../config/adminforge";

import fs from "fs";
import path from "path";

function serializeConfig() {
  const configPath = path.join(process.cwd(), "src/config/adminforge.ts");
  let schemaActivity = { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  
  try {
    const stats = fs.statSync(configPath);
    schemaActivity = {
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString()
    };
  } catch (e) {}

  return {
    auth: config.auth,
    collections: config.collections.map((c: any) => ({
      name: c.name,
      label: c.label,
      icon: c.icon || null,
      access: c.access,
      schemaActivity,
      fields: Object.fromEntries(
        Object.entries(c.fields || {}).map(([name, field]: [string, any]) => [
          name,
          {
            type: field.type,
            db: field.db,
            ui: field.ui,
            meta: field.meta,
            access: field.access,
          },
        ])
      ),
    })),
  };
}

export async function GET() {
  const serialized = serializeConfig();
  return Response.json(serialized);
}

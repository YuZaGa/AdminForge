import { config } from "../../../config/adminforge";

function serializeConfig(cfg: typeof config) {
  return {
    ...cfg,
    collections: cfg.collections.map((c) => ({
      name: c.name,
      label: c.label,
      access: c.access,
      fields: Object.fromEntries(
        Object.entries(c.fields).map(([name, field]) => [
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
  const serialized = serializeConfig(config);
  return Response.json(serialized);
}

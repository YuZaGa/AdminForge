import { config } from "../../../config/adminforge";

function serializeConfig(cfg: typeof config) {
  return {
    ...cfg,
    collections: cfg.collections.map((c) => ({
      name: c.name,
      label: c.label,
      fields: Object.fromEntries(
        Object.entries(c.fields).map(([name, field]) => [
          name,
          {
            type: field.type,
            db: field.db,
            ui: field.ui,
          },
        ])
      ),
    })),
  };
}

export async function GET() {
  return Response.json(serializeConfig(config));
}

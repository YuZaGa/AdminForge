import type { AdminForgeConfig } from "@adminforge/core";

function mapFieldType(dbType: string): string {
  const typeMap: Record<string, string> = {
    String: "String",
    Boolean: "Boolean",
    DateTime: "DateTime",
    Int: "Int",
    Float: "Float",
    Json: "Json",
  };
  return typeMap[dbType] ?? "String";
}

export function generatePrismaSchema(
  config: AdminForgeConfig,
  options?: { provider?: string }
): string {
  const provider = options?.provider ?? "sqlite";
  const lines: string[] = [];
  lines.push("generator client {");
  lines.push('  provider = "prisma-client-js"');
  lines.push("}");
  lines.push("");
  lines.push("datasource db {");
  lines.push(`  provider = "${provider}"`);
  lines.push('  url      = env("DATABASE_URL")');
  lines.push("}");
  lines.push("");

  for (const collection of config.collections) {
    lines.push(`model ${collection.name} {`);
    lines.push("  id        String   @id @default(cuid())");
    lines.push("  createdAt DateTime @default(now())");
    lines.push("  updatedAt DateTime @updatedAt");

    for (const [name, field] of Object.entries(collection.fields)) {
      if (field.type === "relation" && field.db.references) {
        lines.push(`  ${name}Id String${field.db.nullable ? "?" : ""}`);
        lines.push(`  ${name}   ${field.db.references.model} @relation(fields: [${name}Id], references: [${field.db.references.field}])`);
      } else {
        const prismaType = mapFieldType(field.db.type);
        const nul = field.db.nullable ? "?" : "";
        const annotations: string[] = [];
        if (field.db.unique) annotations.push("@unique");
        if (field.db.default !== undefined) {
          const val = field.db.default;
          if (typeof val === "string") {
            annotations.push(`@default("${val}")`);
          } else if (typeof val === "boolean") {
            annotations.push(`@default(${String(val)})`);
          } else {
            annotations.push(`@default(${String(val)})`);
          }
        }
        const ann = annotations.length > 0 ? ` ${annotations.join(" ")}` : "";
        lines.push(`  ${name} ${prismaType}${nul}${ann}`);
      }
    }

    lines.push("}");
    lines.push("");
  }

  return lines.join("\n");
}

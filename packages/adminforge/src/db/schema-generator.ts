import type { AdminForgeConfig } from "../core";

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
  
  // For SQLite, if no DATABASE_URL is set, default to file:./dev.db for better Zero-Config DX
  const url = process.env.DATABASE_URL || (provider === "sqlite" ? "file:./dev.db" : undefined);
  if (url) {
    lines.push(`  url      = "${url}"`);
  } else {
    lines.push('  url      = env("DATABASE_URL")');
  }
  lines.push("}");
  lines.push("");

  const inverseRelations: Record<string, string[]> = {};

  // First pass: generate fields for each model and collect inverse relations
  const modelBlocks: Record<string, string[]> = {};

  for (const collection of config.collections) {
    const modelName = collection.name;
    const block: string[] = [];
    block.push(`model ${modelName} {`);
    block.push("  id        String   @id @default(cuid())");
    block.push("  createdAt DateTime @default(now())");
    block.push("  updatedAt DateTime @updatedAt");

    for (const [name, field] of Object.entries(collection.fields)) {
      if (field.type === "relation") {
        const targetModel = (field.db.references?.model as string) || (field.ui.props?.to as string) || "String";
        const relType = field.db.relationType || "many-to-one";

        if (!inverseRelations[targetModel]) inverseRelations[targetModel] = [];

        if (relType === "many-to-many") {
          block.push(`  ${name} ${targetModel}[]`);
          inverseRelations[targetModel].push(`  adminforge_inverse_${modelName}_${name} ${modelName}[]`);
        } else if (relType === "one-to-many") {
          block.push(`  ${name} ${targetModel}[]`);
          inverseRelations[targetModel].push(`  adminforge_inverse_${modelName}_${name}Id String?`);
          inverseRelations[targetModel].push(`  adminforge_inverse_${modelName}_${name} ${modelName}? @relation(fields: [adminforge_inverse_${modelName}_${name}Id], references: [id])`);
        } else {
          // many-to-one (default)
          block.push(`  ${name}Id String${field.db.nullable ? "?" : ""}`);
          block.push(`  ${name}   ${targetModel}${field.db.nullable ? "?" : ""} @relation(fields: [${name}Id], references: [id])`);
          inverseRelations[targetModel].push(`  adminforge_inverse_${modelName}_${name} ${modelName}[]`);
        }
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
        block.push(`  ${name} ${prismaType}${nul}${ann}`);
      }
    }

    modelBlocks[modelName] = block;
  }

  // Second pass: append inverse relations and close blocks
  for (const collection of config.collections) {
    const modelName = collection.name;
    const block = modelBlocks[modelName];
    if (inverseRelations[modelName]) {
      block.push("");
      block.push("  // Auto-generated inverse relations");
      for (const inv of inverseRelations[modelName]) {
        block.push(inv);
      }
    }
    block.push("}");
    lines.push(block.join("\n"));
    lines.push("");
  }

  return lines.join("\n");
}

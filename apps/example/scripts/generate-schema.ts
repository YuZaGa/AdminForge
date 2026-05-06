import { generatePrismaSchema } from "@adminforge/db";
import { config } from "../src/config/adminforge";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");

let provider = "sqlite";
if (existsSync(schemaPath)) {
  const existing = readFileSync(schemaPath, "utf-8");
  const match = existing.match(/provider\s*=\s*"(.*)"/);
  if (match) {
    provider = match[1];
  }
}

const schema = generatePrismaSchema(config, { provider });
writeFileSync(schemaPath, schema);
console.log(`Generated Prisma schema at prisma/schema.prisma (provider: ${provider})`);

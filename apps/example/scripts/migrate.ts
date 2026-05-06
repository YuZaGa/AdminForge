import { generatePrismaSchema } from "@adminforge/db";
import { config } from "../src/config/adminforge";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");

let provider = "sqlite";
if (existsSync(schemaPath)) {
  const existing = readFileSync(schemaPath, "utf-8");
  const datasourceMatch = existing.match(/datasource db \{[^}]*provider\s*=\s*"(.*)"/);
  if (datasourceMatch) {
    provider = datasourceMatch[1];
  }
}

const schema = generatePrismaSchema(config, { provider });
writeFileSync(schemaPath, schema);
console.log(`Generated Prisma schema at prisma/schema.prisma (provider: ${provider})`);

const args = process.argv.slice(2);
const nameIndex = args.indexOf("--name");
const name = nameIndex !== -1 ? args[nameIndex + 1] : undefined;
const isPush = args.includes("--push");

execSync("prisma generate", { stdio: "inherit" });

if (isPush) {
  execSync("prisma db push", { stdio: "inherit" });
  console.log("Database schema pushed.");
} else if (name) {
  execSync(`prisma migrate dev --name "${name}"`, { stdio: "inherit" });
  console.log(`Migration "${name}" created and applied.`);
} else {
  execSync("prisma migrate dev", { stdio: "inherit" });
  console.log("Migration applied.");
}

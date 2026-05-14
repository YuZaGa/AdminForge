#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log("Usage: adminforge <command>");
  console.log("Commands: makemigrations, migrate");
  process.exit(1);
}

// Find config file
const possiblePaths = [
  "adminforge.ts",
  "admin.config.ts",
  "src/admin.config.ts",
  "src/config/adminforge.ts"
];

let configPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(path.resolve(process.cwd(), p))) {
    configPath = p;
    break;
  }
}

if (!configPath) {
  console.error("Could not find adminforge config. Looked for:", possiblePaths.join(", "));
  process.exit(1);
}

const isMakemigrations = command === "makemigrations";
const isMigrate = command === "migrate";

if (isMakemigrations || isMigrate) {
  // We need to generate the Prisma schema first.
  const tempScriptPath = path.resolve(process.cwd(), ".adminforge-runner.ts");
  
  const runnerContent = `
import { generatePrismaSchema } from "@adminforge/core";
import { config } from "./${configPath.replace(".ts", "")}";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");

let provider = "sqlite";
if (existsSync(schemaPath)) {
  const existing = readFileSync(schemaPath, "utf-8");
  const datasourceMatch = existing.match(/datasource db \\{[^}]*provider\\s*=\\s*"(.*)"/);
  if (datasourceMatch) {
    provider = datasourceMatch[1];
  }
}

const schema = generatePrismaSchema(config, { provider });
const prismaDir = resolve(process.cwd(), "prisma");
if (!existsSync(prismaDir)) {
  mkdirSync(prismaDir);
}
writeFileSync(schemaPath, schema);
console.log("Generated Prisma schema at prisma/schema.prisma (provider: " + provider + ")");
`;

  fs.writeFileSync(tempScriptPath, runnerContent);

  try {
    // Generate schema
    execSync(`npx tsx ${tempScriptPath}`, { stdio: "inherit" });
    
    // Now run prisma command
    if (isMakemigrations) {
      const nameIndex = args.indexOf("--name");
      const name = nameIndex !== -1 ? args[nameIndex + 1] : "auto";
      execSync(`npx prisma migrate dev --name "${name}" --create-only`, { stdio: "inherit" });
      console.log(`Created migration: ${name}`);
    } else if (isMigrate) {
      if (args.includes("--push")) {
        execSync("npx prisma db push", { stdio: "inherit" });
      } else if (args.includes("--deploy")) {
        execSync("npx prisma migrate deploy", { stdio: "inherit" });
      } else {
        execSync("npx prisma migrate dev", { stdio: "inherit" });
      }
      execSync("npx prisma generate", { stdio: "inherit" });
      console.log("Applied changes and generated client.");
    }
  } catch (error) {
    console.error("Error executing command", error);
  } finally {
    if (fs.existsSync(tempScriptPath)) {
      fs.unlinkSync(tempScriptPath);
    }
  }
} else {
  console.log(`Unknown command: ${command}`);
}

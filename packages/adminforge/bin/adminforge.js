#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const args = process.argv.slice(2);
const command = args[0];

function resolvePrisma() {
  const candidates = [
    "node_modules/@adminforge/core/node_modules/.bin/prisma",
    "node_modules/.bin/prisma",
  ];
  for (const c of candidates) {
    const full = path.resolve(process.cwd(), c);
    if (fs.existsSync(full)) return full;
  }
  return "npx prisma";
}

function generateSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function writeFile(dest, content) {
  const fullPath = path.resolve(process.cwd(), dest);
  if (fs.existsSync(fullPath)) {
    console.log(`  ${dest} — already exists, skipped`);
    return false;
  }
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart() + "\n");
  console.log(`  ✓ ${dest}`);
  return true;
}

if (!command) {
  console.log("Usage: adminforge <command>");
  console.log("Commands: init, makemigrations, migrate");
  process.exit(1);
}

if (command === "init") {
  console.log("\nScaffolding AdminForge project...\n");

  writeFile("adminforge.ts", `
import { defineConfig, collection, fields } from "@adminforge/core";

export const config = defineConfig({
  auth: {
    enabled: true,
  },
  collections: [
    collection({
      name: "posts",
      label: "Posts",
      fields: {
        title: fields.text({ required: true }),
        content: fields.richText(),
      },
    }),
  ],
});
`);

  writeFile("auth.ts", `
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * ⚠ Replace these demo credentials before production deployment.
 * Use environment variables or a real database for user storage.
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "admin@adminforge.com" &&
          credentials?.password === "admin"
        ) {
          return { id: "1", name: "Admin", email: "admin@adminforge.com", role: "admin" };
        }
        if (
          credentials?.email === "editor@adminforge.com" &&
          credentials?.password === "editor"
        ) {
          return { id: "2", name: "Editor", email: "editor@adminforge.com", role: "editor" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.role = token.role;
      return session;
    },
  },
  trustHost: true,
});
`);

  writeFile("lib/db.ts", `
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
`);

  writeFile("app/api/auth/[...nextauth]/route.ts", `
import { handlers } from "../../../../auth";

export const GET = handlers.GET;
export const POST = handlers.POST;
`);

  writeFile("app/api/adminforge/[...slug]/route.ts", `
import { createAdminForgeApi } from "@adminforge/core/next";
import { config } from "../../../../adminforge";
import { db } from "../../../../lib/db";
import { auth } from "../../../../auth";

const handler = createAdminForgeApi({ config, db, auth });

export const GET = handler.GET;
export const POST = handler.POST;
export const PATCH = handler.PATCH;
export const DELETE = handler.DELETE;
`);

  writeFile("app/admin/layout.tsx", `
import { AuthProvider } from "@adminforge/core/auth-client";
import { auth } from "../../auth";
import "@adminforge/core/styles.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[AdminForge] Session retrieval failed:", e);
  }

  return (
    <AuthProvider session={session}>
      {children}
    </AuthProvider>
  );
}
`);

  writeFile("app/admin/[[...admin]]/page.tsx", `
import { AdminDashboard } from "@adminforge/core/ui";

export default function AdminPage() {
  return (
    <main style={{ height: "100vh" }}>
      <AdminDashboard />
    </main>
  );
}
`);

  // .env: append only missing keys
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const envUpdates = [];
  if (!envContent.includes("AUTH_SECRET=")) {
    envUpdates.push(`AUTH_SECRET="${generateSecret()}"`);
  }
  if (!envContent.includes("DATABASE_URL=")) {
    envUpdates.push('DATABASE_URL="file:./dev.db"');
  }

  if (envUpdates.length > 0) {
    const addendum = "\n" + envUpdates.join("\n") + "\n";
    fs.appendFileSync(envPath, addendum);
    for (const key of envUpdates) {
      console.log(`  ✓ .env — added ${key.split("=")[0]}`);
    }
  } else {
    console.log("  .env — already configured, skipped");
  }

  console.log(`
Done. Next steps:

1. Install dependencies (if not already done)
   npm install @adminforge/core

2. Generate schema and sync database
   npx adminforge migrate

3. Start dev server
   npm run dev

4. Visit
   http://localhost:3000/admin
`);
  process.exit(0);
}

// Find config file (for migrate/makemigrations commands)
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

// Provide default DATABASE_URL if missing for SQLite Zero-Config
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

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
    const prismaBin = resolvePrisma();
    if (isMakemigrations) {
      const nameIndex = args.indexOf("--name");
      const name = nameIndex !== -1 ? args[nameIndex + 1] : "auto";
      execSync(`${prismaBin} migrate dev --name "${name}" --create-only`, { stdio: "inherit" });
      console.log(`Created migration: ${name}`);
    } else if (isMigrate) {
      if (args.includes("--push")) {
        execSync(`${prismaBin} db push`, { stdio: "inherit" });
      } else if (args.includes("--deploy")) {
        execSync(`${prismaBin} migrate deploy`, { stdio: "inherit" });
      } else {
        execSync(`${prismaBin} migrate dev`, { stdio: "inherit" });
      }
      execSync(`${prismaBin} generate`, { stdio: "inherit" });
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

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createDbClient } from "@adminforge/core";
import { createController } from "@adminforge/core/next";
import { verifyAgentToken, type SecurityContext } from "@adminforge/core/next";
import { ContentAgent } from "./orchestrator.js";
import path from "path";
import fs from "fs";

// --- GLOBAL STDOUT PROTECTION ---
console.log = (...args) => console.error(...args);

/**
 * --- Configuration & State ---
 */
const CONFIG_PATH_ENV = process.env.ADMINFORGE_CONFIG_PATH;
async function loadConfig() {
  const cwd = process.cwd();
  const fallbacks = [
    CONFIG_PATH_ENV,
    "/home/yuzaga/Code/AdminForge/apps/example/src/config/adminforge.ts",
    "./apps/example/src/config/adminforge.ts",
    "../../apps/example/src/config/adminforge.ts",
  ].filter(Boolean) as string[];

  let resolvedPath: string | null = null;
  for (const p of fallbacks) {
    const absolute = path.isAbsolute(p) ? p : path.resolve(cwd, p);
    if (fs.existsSync(absolute)) {
      resolvedPath = absolute;
      break;
    }
  }

  if (!resolvedPath) throw new Error("Could not find adminforge.ts config file.");
  const importPath = path.isAbsolute(resolvedPath) ? `file://${resolvedPath}` : resolvedPath;
  const mod = await import(importPath);
  return { config: mod.config, path: resolvedPath };
}

/**
 * --- MCP Server Implementation ---
 */
const server = new Server(
  { name: "adminforge-ai", version: "0.3.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_form_schema",
        description: "Returns schema + AI hints for a collection. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { collection: { type: "string" }, token: { type: "string" } },
          required: ["collection", "token"],
        },
      },
      {
        name: "list_records",
        description: "Lists records from a collection. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { collection: { type: "string" }, limit: { type: "number" }, token: { type: "string" } },
          required: ["collection", "token"],
        },
      },
      {
        name: "search_records",
        description: "Search records in a collection by keyword. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { collection: { type: "string" }, query: { type: "string" }, token: { type: "string" } },
          required: ["collection", "query", "token"],
        },
      },
      {
        name: "create_record",
        description: "Creates record in AdminForge. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { collection: { type: "string" }, data: { type: "object" }, token: { type: "string" } },
          required: ["collection", "data", "token"],
        },
      },
      {
        name: "update_record",
        description: "Updates an existing record. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { collection: { type: "string" }, id: { type: "string" }, data: { type: "object" }, token: { type: "string" } },
          required: ["collection", "id", "data", "token"],
        },
      },
      {
        name: "delete_record",
        description: "Deletes a record. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { collection: { type: "string" }, id: { type: "string" }, token: { type: "string" } },
          required: ["collection", "id", "token"],
        },
      },
      {
        name: "upload_media",
        description: "Uploads a file (base64) to the media directory. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: { filename: { type: "string" }, base64: { type: "string" }, token: { type: "string" } },
          required: ["filename", "base64", "token"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const token = (args as any).token || process.env.ADMINFORGE_TOKEN;
  
  if (!token) {
    throw new Error("Unauthorized: Missing token");
  }

  // --- DB TOOLS ---
  const agentSession = verifyAgentToken(token!);
  const { config, path: configPath } = await loadConfig();
  const db = createDbClient(config);
  const agent = new ContentAgent(config, db);

  const securityContext: SecurityContext = { agent: agentSession, source: "agent" };

  switch (name) {
    case "get_form_schema": {
      const col = (args as any).collection;
      const fields = agent.getEnrichedSchema(col);
      return { content: [{ type: "text", text: JSON.stringify({ collection: col, fields }, null, 2) }] };
    }

    case "list_records": {
      const col = (args as any).collection;
      const limit = (args as any).limit || 50;
      const results = await db.findMany(col, { take: limit });
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    case "search_records": {
      const col = (args as any).collection;
      const query = (args as any).query;
      const collection = config.collections.find((c: any) => c.name === col)!;
      const controller = createController(collection, db, securityContext);
      const results = await controller.list({ search: query });
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    case "create_record": {
      const col = (args as any).collection;
      const collection = config.collections.find((c: any) => c.name === col)!;
      const controller = createController(collection, db, securityContext);
      const result = await controller.create((args as any).data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    case "update_record": {
      const col = (args as any).collection;
      const id = (args as any).id;
      const collection = config.collections.find((c: any) => c.name === col)!;
      const controller = createController(collection, db, securityContext);
      const result = await controller.update(id, (args as any).data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    case "delete_record": {
      const col = (args as any).collection;
      const id = (args as any).id;
      const collection = config.collections.find((c: any) => c.name === col)!;
      const controller = createController(collection, db, securityContext);
      const result = await controller.delete(id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    case "upload_media": {
      const filename = (args as any).filename;
      const base64 = (args as any).base64;
      const buffer = Buffer.from(base64, "base64");
      
      // Resolve upload directory relative to config
      const configDir = path.dirname(configPath);
      const uploadDir = path.resolve(configDir, "../../public/uploads");
      
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fullPath = path.join(uploadDir, filename);
      fs.writeFileSync(fullPath, buffer);
      
      return { content: [{ type: "text", text: JSON.stringify({ url: `/uploads/${filename}`, status: "uploaded" }, null, 2) }] };
    }

    default:
      throw new Error(`Tool ${name} not found`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

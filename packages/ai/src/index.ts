import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createDbClient } from "@adminforge/db";
import { createController } from "@adminforge/api";
import { verifyAgentToken, type SecurityContext } from "@adminforge/api/security";
import { ContentAgent } from "./orchestrator";
import { defineAIHints } from "./hints";

/**
 * --- Configuration ---
 */
const CONFIG_PATH = "./adminforge-config.ts";

async function loadConfig() {
  const mod = await import(CONFIG_PATH);
  return mod.config;
}

// Example AI Hints Definition
const aiHints = defineAIHints({
  posts: {
    description: "Engaging technical blog posts.",
    fields: {
      title: { description: "Catchy, SEO-optimized title." },
      content: { style: "Professional, technical, uses subheaders." },
    },
  },
});

/**
 * --- MCP Server Implementation ---
 */
const server = new Server(
  {
    name: "adminforge-ai",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_form_schema",
        description: "Returns schema + AI hints for a collection. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string" },
            token: { type: "string" },
          },
          required: ["collection", "token"],
        },
      },
      {
        name: "validate_and_resolve",
        description: "Validates data and resolves relation names to IDs. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string" },
            data: { type: "object" },
            token: { type: "string" },
          },
          required: ["collection", "data", "token"],
        },
      },
      {
        name: "create_record",
        description: "Creates record in AdminForge. REQUIRES TOKEN.",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string" },
            data: { type: "object" },
            token: { type: "string" },
          },
          required: ["collection", "data", "token"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const token = (args as any).token || process.env.ADMINFORGE_TOKEN;
  const apiUrl = process.env.ADMINFORGE_API_URL;

  if (!token) throw new Error("Unauthorized: Missing token (provide in arguments or ADMINFORGE_TOKEN env)");

  // --- REMOTE PROXY MODE ---
  if (apiUrl) {
    console.error(`[MCP] Proxying ${name} to ${apiUrl}...`);
    
    switch (name) {
      case "get_form_schema": {
        const res = await fetch(`${apiUrl}/api/config`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const config = await res.json();
        const collectionName = (args as any).collection;
        const collection = (config as any).collections.find((c: any) => c.name === collectionName);
        // We could also implement the enrichment here or have a dedicated endpoint
        return { content: [{ type: "text", text: JSON.stringify(collection, null, 2) }] };
      }

      case "create_record": {
        const collectionName = (args as any).collection;
        const res = await fetch(`${apiUrl}/api/${collectionName}`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify((args as any).data)
        });
        const result = await res.json();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`Tool ${name} is not yet proxied in Remote Mode`);
    }
  }

  // --- LOCAL MODE (Existing logic) ---
  const agentSession = verifyAgentToken(token);
  const config = await loadConfig();
  const db = createDbClient(config);
  const agent = new ContentAgent(config, db, aiHints);

  const securityContext: SecurityContext = {
    agent: agentSession,
    source: "agent",
  };

  switch (name) {
    case "get_form_schema": {
      const collectionName = (args as any).collection;
      const fields = agent.getEnrichedSchema(collectionName);
      return {
        content: [{ type: "text", text: JSON.stringify({ collection: collectionName, fields }, null, 2) }],
      };
    }

    case "validate_and_resolve": {
      const collectionName = (args as any).collection;
      const rawData = (args as any).data;
      const { resolvedData, unresolved } = await agent.resolveRelations(collectionName, rawData);
      const validation = await agent.validate(collectionName, resolvedData);

      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            valid: validation.valid && unresolved.length === 0,
            data: resolvedData,
            unresolved,
            errors: validation.valid ? [] : (validation as any).errors
          }, null, 2) 
        }],
      };
    }

    case "create_record": {
      const collectionName = (args as any).collection;
      const data = (args as any).data;
      const config = await loadConfig();
      const collection = config.collections.find((c: any) => c.name === collectionName)!;
      const controller = createController(collection, db, securityContext);
      const result = await controller.create(data);
      return {
        content: [{ type: "text", text: JSON.stringify({ id: (result as any).id, status: "created" }, null, 2) }],
      };
    }

    default:
      throw new Error(`Tool ${name} not found or not yet refactored for V2`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

console.error("AdminForge AI MCP Server V2 (Secure) running on stdio");

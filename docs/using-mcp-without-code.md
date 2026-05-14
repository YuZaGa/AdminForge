# Using MCP with AdminForge — Without Modifying Any Code

AdminForge ships with a built-in MCP (Model Context Protocol) server in the `@adminforge/ai` package. This means you can connect AI agents (Claude, Cursor, Copilot, etc.) to your admin data **without writing a single line of code** beyond your existing `adminforge.ts` schema definition.

## How It Works

```
AI Agent (Claude Desktop, Cursor, etc.)
       │
       │  MCP Protocol (stdio)
       ▼
AdminForge MCP Server  ───→  Local: Direct DB access
  (npx adminforge-ai)   ───→  Remote: REST API proxy
       │
       ▼
  JWT-scoped token enforces RBAC at every step
```

The MCP server exposes these tools that an AI agent can call:

| Tool | What it does |
|------|-------------|
| `get_form_schema` | Returns the schema for a collection, including required fields and types. |
| `list_records` | Lists records from a collection with optional limits. |
| `search_records` | Performs a keyword search across text-based fields in a collection. |
| `create_record` | Creates a new record with automatic validation and RBAC enforcement. |
| `update_record` | Updates an existing record by ID. |
| `delete_record` | Deletes a record by ID. |
| `upload_media` | Uploads files (images/docs) and returns the public URL. |

## Prerequisites

- An existing AdminForge project (any project using the `@adminforge/core` package)
- Node.js 18+

## Step 1: Install the AI Package

```bash
npm install @adminforge/ai
```

No code changes needed — this is a dev-time CLI tool.

## Step 2: Generate an Agent Token

Agent tokens are short-lived JWTs that scope what an AI agent can do:

```bash
npx adminforge-ai token \
  --user claude-agent \
  --role editor \
  --scopes "posts:create,posts:read,categories:read,tags:read"
```

This prints a token like `eyJhbGciOiJIUzI1NiIs...`. Keep it secure — it expires in 10 minutes by default.

**No code changes needed.** The token carries its own permissions; your existing `adminforge.ts` RBAC rules are enforced automatically.

## Step 3: Start the MCP Server

### Local Mode (Direct DB Access)

Use this when the MCP server runs on the same machine as your database:

```bash
npx adminforge-ai start --config ./adminforge.ts
```

Set environment variables:

```bash
DATABASE_URL="file:./dev.db"
ADMINFORGE_SECRET="your-secret-key"
```

### Remote Proxy Mode (Point to a Deployed Instance)

Use this when your AdminForge app is deployed and the MCP server connects via REST:

```bash
npx adminforge-ai start \
  --api-url https://my-app.com \
  --token <AGENT_TOKEN>
```

**No code changes needed** in either mode. The server reads your config, uses your existing database or API, and enforces your existing access rules.

## Step 4: Configure Your AI Tool

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "adminforge": {
      "command": "npx",
      "args": [
        "@adminforge/ai",
        "start",
        "--config",
        "/path/to/your/adminforge.ts"
      ],
      "env": {
        "DATABASE_URL": "file:/path/to/dev.db",
        "ADMINFORGE_SECRET": "your-secret-key"
      }
    }
  }
}
```

### Cursor

In Cursor Settings → MCP Servers, add a new server:

- **Name:** `adminforge`
- **Type:** `command`
- **Command:** `npx @adminforge/ai start --config ./adminforge.ts`
- **Environment variables:** `DATABASE_URL`, `ADMINFORGE_SECRET`

### VS Code (Copilot / Continue.dev) or Any MCP Client

Same pattern — point it at the `adminforge-ai` binary with your config path.

## What the AI Agent Can Do (Without Code Changes)

Once connected, an AI agent can:

1. **Discover your schema** — Ask "What collections and fields are available?" and the MCP server returns everything from your `adminforge.ts` config, including field types, validation rules, and relationship layouts.

2. **Search and Manage Records** — The agent can search for existing data (e.g., to find IDs for categories) and perform CRUD operations while respecting your RBAC rules.

3. **Handle Media** — Agents can upload images and other media directly into your project's upload directory.

## Security — Built In, No Code Needed

Every MCP tool call requires a token. The server verifies the JWT and checks:

- **Token scoping** — Does the token include `posts:create`? If not, the request is rejected.
- **RBAC enforcement** — Does the agent's role (e.g., `editor`) have `create` access on the `posts` collection per your `adminforge.ts` config?
- **Field-level access** — If a field has `access: { update: ["admin"] }`, an editor agent cannot write to it.

**You never need to write auth middleware or permission checks.** Your existing `adminforge.ts` config handles everything.

## Quick Reference

```bash
# 1. Install
npm install @adminforge/ai

# 2. Generate a token
npx adminforge-ai token --user bot --role editor --scopes "posts:create,posts:read"

# 3. Start server
npx adminforge-ai start --config ./adminforge.ts
```

## Summary

| Concern | Code You Write |
|---------|---------------|
| Schema definition | Already done in `adminforge.ts` |
| RBAC rules | Already done in `adminforge.ts` |
| MCP server setup | Zero — just `npm install` + `npx` |
| Agent tokens | Zero — CLI generates them |
| Auth enforcement | Zero — your config is auto-enforced |

**AdminForge + MCP = AI-native admin without boilerplate.**

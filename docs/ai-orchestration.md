# AI Orchestration

AdminForge provides a first-class interface for AI agents through agent tokens and an MCP (Model Context Protocol) server. This enables LLMs like Claude, GPT, and Gemini to securely interact with your admin data.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   AI Agent   │────▶│  MCP Server  │────▶│  AdminForge  │
│ (Claude/GPT) │     │ (stdio/http) │     │  REST API    │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                     ┌─────┴─────┐
                     │ Agent Token│
                     │ (JWT)     │
                     └───────────┘
```

## Agent Tokens

Agent tokens are short-lived, scoped JWTs that authorize AI agents to perform specific operations.

### Generate via Dashboard

1. Go to `Settings > Agent Tokens` in the admin dashboard
2. Select collections and actions (e.g., `posts:create`, `posts:read`)
3. Set expiration time (default: 10 minutes)
4. Copy the generated token

### Generate via CLI

```bash
npx adminforge-ai token \
  --user agent-1 \
  --role editor \
  --scopes "posts:create,posts:read,categories:read"
```

### Generate via API

```ts
import { generateAgentToken } from "adminforge/next";

const token = generateAgentToken(
  userId,       // string
  role,         // string
  scopes,       // string[] — ["collection:action", ...]
  expiresIn,    // number — seconds (default: 600)
);
```

### Token Format

```ts
type AgentTokenPayload = {
  sub: string;         // user ID
  role: string;        // RBAC role
  scope: string[];     // ["collection:action", ...]
  iat: number;         // issued at
  exp: number;         // expires at
  iss: "adminforge";   // issuer
  aud: "agent";        // audience
  sessionId: string;   // unique session (for future revocation)
};
```

### Using a Token

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "AI-Generated Post", "content": "<p>Written by an agent</p>"}'
```

## MCP Server

The MCP (Model Context Protocol) server allows AI agents to discover your schema, validate data, and create records through a standardized interface.

### Installation

The AI package is included in the monorepo but published separately:

```bash
npm install @adminforge/ai
```

### Starting the Server

```bash
# Local mode (requires direct database access)
npx adminforge-ai start --config ./adminforge.ts

# Remote proxy mode (points to a running AdminForge instance)
npx adminforge-ai start --api-url http://localhost:3000 --token <AGENT_TOKEN>
```

### MCP Tools

The server exposes these tools to AI agents:

| Tool | Description |
|------|-------------|
| `get_form_schema` | Returns the schema + AI hints for a collection |
| `validate_and_resolve` | Validates data and resolves relation names to IDs |
| `create_record` | Creates a record with automatic RBAC enforcement |

### Using with Claude/Cursor/etc.

Configure your AI tool's MCP settings:

```json
{
  "mcpServers": {
    "adminforge": {
      "command": "npx",
      "args": ["adminforge-ai", "start", "--config", "./adminforge.ts"]
    }
  }
}
```

## AI Hints

Provide guidance to AI agents about how to generate content for your collections:

```ts
import { defineAIHints } from "@adminforge/ai";

export const hints = defineAIHints({
  posts: {
    description: "Engaging technical blog posts.",
    fields: {
      title: { description: "Catchy, SEO-optimized title." },
      content: { style: "Professional, technical, uses subheaders." },
    },
  },
  categories: {
    description: "Content categories and tags.",
    fields: {
      name: { description: "Short, descriptive category name." },
    },
  },
});
```

## Security Model

AdminForge uses a dual-layer security model for AI agents:

1. **Token Scoping** — The JWT defines which collections and actions the agent can access (e.g., `posts:read` only)
2. **RBAC Enforcement** — The agent's role (embedded in the token) is checked against collection and field access rules

This means you can give an agent read-only access to posts but full CRUD on categories — all without modifying any code.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ADMINFORGE_SECRET` | Secret key for signing agent tokens (required in production) |
| `ADMINFORGE_API_URL` | Remote API URL for proxy mode |
| `ADMINFORGE_TOKEN` | Default agent token for proxy mode |
| `ADMINFORGE_CONFIG_PATH` | Path to adminforge.ts (default: `./adminforge.ts`) |

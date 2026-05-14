# 🛡️ AdminForge

**The Security-First, Agentic CMS Framework.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black)](https://nextjs.org/)
[![Database: Prisma](https://img.shields.io/badge/Database-Prisma-2D3748)](https://www.prisma.io/)
[![Architecture: Monorepo](https://img.shields.io/badge/Architecture-Turborepo-EF4444)](https://turbo.build/)

Define your data schema in `adminforge.ts`, run a few commands, and get a fully functional admin dashboard with REST API, RBAC, and AI agent orchestration — like Django Admin for Next.js.

```bash
npx create-next-app@latest my-app && cd my-app
npm install @adminforge/core @prisma/client next-auth
npx adminforge migrate --push
```

### 0.3.0 Release: Elite DX
The latest version introduces **Self-Configuring UI**. Just add the provider to your layout and drop the dashboard into any page. No manual serialization required.

See the [Quickstart](docs/quickstart.md) to get running in 5 minutes.

## Features

- **Schema-Driven Admin** — Define collections and fields in code, get a full CRUD UI
- **RBAC** — Role-based access control at the collection and field level
- **AI Orchestration** — Scoped JWT tokens and MCP server for LLM agents
- **Rich Text** — Full-featured Tiptap editor with images, links, and formatting
- **REST API** — Auto-generated API with validation, search, and pagination
- **Customizable** — Custom fields, lifecycle hooks, and extensible component system

## Documentation

| Section | Description |
|---------|-------------|
| [Quickstart](docs/quickstart.md) | Install, configure, and run |
| [Schema Reference](docs/schema.md) | Collections, fields, hooks, access control |
| [Authentication & RBAC](docs/auth.md) | Auth setup, roles, permissions |
| [AI Orchestration](docs/ai-orchestration.md) | Agent tokens, MCP server, LLM integration |
| [API Reference](docs/api-reference.md) | Full export reference for all packages |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| ORM | Prisma (SQLite/PostgreSQL) |
| Auth | NextAuth v5 |
| UI | Custom design system (vanilla CSS) |
| Editor | Tiptap |
| AI | MCP Protocol (stdio/HTTP) |
| Monorepo | Turborepo + pnpm |

## License

MIT

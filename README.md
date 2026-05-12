# 🛡️ AdminForge

**The Security-First, Agentic CMS Framework.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black)](https://nextjs.org/)
[![Database: Prisma](https://img.shields.io/badge/Database-Prisma-2D3748)](https://www.prisma.io/)
[![Architecture: Monorepo](https://img.shields.io/badge/Architecture-Turborepo-EF4444)](https://turbo.build/)

AdminForge is a high-performance, developer-centric monorepo designed to build beautiful administrative interfaces that are natively compatible with AI Agents. It bridges the gap between traditional CMS content management and the new era of **Agentic Orchestration**.

---

## ✨ Key Features

- **🔐 Secure AI Handshake**: Built-in Agent Token generation with configurable expiration and fine-grained scoping (Least Privilege).
- **🤖 Agentic Orchestration**: Natively designed for LLMs (Gemini, Claude, GPT) to perform secure, RBAC-compliant database operations.
- **🎨 Premium UI System**: A custom-crafted design system focusing on glassmorphism, modern typography (Inter/Outfit), and vibrant dark modes.
- **📝 Rich Text Mastery**: Integrated Tiptap editor with custom image handling, alignment controls, and fluid layouts.
- **🏗️ Scalable Monorepo**: Powered by Turborepo, separating core logic, UI components, and AI orchestration into reusable packages.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | Next.js 15 (App Router) |
| **Styling** | Vanilla CSS (Modern CSS Variables) |
| **Database/ORM** | Prisma & PostgreSQL/SQLite |
| **Auth** | NextAuth.js v5 |
| **Editor** | Tiptap (Pro-level extensions) |
| **Build System** | Turborepo & pnpm |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- pnpm 9+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/AdminForge.git
cd AdminForge

# Install dependencies
pnpm install

# Generate Prisma client
pnpm build
```

### 3. Environment Setup
Create a `.env` file in `apps/example`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
ADMINFORGE_SECRET="your-agent-signing-secret"
```

### 4. Run Development
```bash
pnpm dev
```
Navigate to `http://localhost:3000/admin` to explore the dashboard.

---

## 🤖 AI Orchestration (How it works)

AdminForge allows you to issue **Agent Tokens** that authorize AI Agents to talk to your API.

1. **Generate**: Go to `Settings > Agent Tokens` in the dashboard.
2. **Scope**: Select which collections the agent can access (e.g., `posts:create`).
3. **Connect**: Pass the token in the `Authorization: Bearer <token>` header.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello from Agent", "content": "<p>Written by AI</p>"}'
```

---

## 📂 Project Structure

```text
├── apps
│   └── example         # The reference implementation (Next.js App)
├── packages
│   ├── api             # Core API handlers & Security Context
│   ├── db              # Prisma client & Database abstractions
│   ├── auth            # Authentication logic & RBAC
│   ├── admin-ui        # Shared React components & Design System
│   └── ai              # The AI Orchestrator & MCP Server logic
├── turbo.json          # Build pipeline configuration
└── pnpm-workspace.yaml # Monorepo definition
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ by the AdminForge Team.**

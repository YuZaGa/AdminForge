import { Command } from "commander";
import { generateAgentToken } from "adminforge/next";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .name("adminforge-ai")
  .description("CLI to manage AdminForge AI Orchestration and MCP Server")
  .version("0.2.0");

/**
 * Command: Start the MCP Server
 */
program
  .command("start")
  .description("Start the MCP server on stdio")
  .option("-c, --config <path>", "Path to adminforge.ts", "./adminforge.ts")
  .option("-u, --api-url <url>", "Remote AdminForge API URL (Proxy Mode)")
  .option("-t, --token <token>", "Agent Token for Proxy Mode")
  .option("-d, --db <url>", "Database URL (Local Mode)")
  .action((options) => {
    console.error("🚀 Starting AdminForge AI MCP Server...");
    
    // Prepare environment
    const env = { ...process.env };
    if (options.config) env.ADMINFORGE_CONFIG_PATH = options.config;
    if (options.db) env.DATABASE_URL = options.db;
    if (options.apiUrl) env.ADMINFORGE_API_URL = options.apiUrl;
    if (options.token) env.ADMINFORGE_TOKEN = options.token;

    // Run the MCP server process
    const serverPath = path.join(__dirname, "index.js");
    const child = spawn("node", [serverPath], {
      env,
      stdio: ["inherit", "inherit", "inherit"],
    });

    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  });

/**
 * Command: Generate Token
 */
program
  .command("token")
  .description("Generate a scoped Agent Token")
  .requiredOption("-u, --user <id>", "User ID")
  .requiredOption("-r, --role <name>", "User Role")
  .requiredOption("-s, --scopes <list>", "Comma-separated scopes (e.g., posts:create,posts:read)")
  .action((options) => {
    const scopes = options.scopes.split(",").map((s: string) => s.trim());
    try {
      const token = generateAgentToken(options.user, options.role, scopes);
      console.log("\n🔑 Generated Agent Token:");
      console.log("-----------------------------------------");
      console.log(token);
      console.log("-----------------------------------------");
      console.log("Keep this token secure. It expires in 10 minutes.");
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  });

program.parse();

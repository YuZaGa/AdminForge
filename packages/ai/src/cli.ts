#!/usr/bin/env node
import { Command } from "commander";
import { generateAgentToken } from "@adminforge/core/next";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .name("adminforge-ai")
  .description("AdminForge AI - MCP Server & Agent Management")
  .version("0.1.0");

program
  .command("start")
  .description("Start the MCP server on stdio")
  .option("-c, --config <path>", "Path to adminforge.ts", "./adminforge.ts")
  .option("-u, --api-url <url>", "Remote AdminForge API URL (Proxy Mode)")
  .option("-t, --token <token>", "Agent Token for Proxy Mode")
  .option("-d, --db <url>", "Database URL (Local Mode)")
  .action((options) => {
    const { config, apiUrl, token, db } = options;
    
    // Proxy Mode
    if (apiUrl && token) {
      console.log(`Starting AdminForge MCP in PROXY mode pointing to ${apiUrl}`);
      // Internal MCP logic would go here
      return;
    }

    // Local Mode
    console.log(`Starting AdminForge MCP in LOCAL mode using config: ${config}`);
    
    const env = { ...process.env };
    if (db) env.DATABASE_URL = db;

    // Use tsx to run the MCP server entry point
    const mcpPath = path.resolve(__dirname, "./index.js");
    const child = spawn("node", [mcpPath], {
      stdio: ["inherit", "inherit", "inherit"],
      env
    });

    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  });

program
  .command("token")
  .description("Generate a scoped agent token")
  .option("--user <id>", "User ID for the agent", "ai-agent")
  .option("--role <role>", "Role for the agent", "admin")
  .option("--scopes <scopes>", "Comma-separated list of scopes (e.g. posts:read,posts:create)")
  .option("--expires <time>", "Expiration time (e.g. 1d, 1h)", "30d")
  .action(async (options) => {
    const secret = process.env.ADMINFORGE_SECRET;
    if (!secret) {
      console.error("Error: ADMINFORGE_SECRET environment variable is not set.");
      process.exit(1);
    }

    // generateAgentToken(userId, role, scopes, expiresInSeconds)
    // We'll default to 30 days in seconds if not provided
    const expiresInSeconds = 30 * 24 * 60 * 60; 

    const token = await generateAgentToken(
      options.user,
      options.role,
      options.scopes ? options.scopes.split(",") : ["*"],
      expiresInSeconds
    );

    console.log("\nGenerated Agent Token:");
    console.log("----------------------");
    console.log(token);
    console.log("----------------------\n");
  });

program.parse();

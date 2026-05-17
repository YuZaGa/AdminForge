import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * --- Security Model Definitions ---
 */

export type Action = "create" | "read" | "update" | "delete";

export type AgentTokenPayload = {
  sub: string;        // userId
  role: string;
  scope: string[];    // format: "collection:action"
  iat: number;
  exp: number;
  iss: "adminforge";
  aud: "agent";
  sessionId: string;
};

export type AgentSession = AgentTokenPayload;

export type SecurityContext = {
  user?: any; // Replace with User type from your auth package
  agent?: AgentSession;
  source: "user" | "agent";
};

function getSecret(): string {
  const secret = process.env.ADMINFORGE_SECRET;
  if (!secret) {
    throw new Error("ADMINFORGE_SECRET env var is required. Generate one with: openssl rand -hex 32");
  }
  return secret;
}

/**
 * --- Utilities ---
 */

function normalizeScope(scope: string): string {
  const normalized = scope.trim().toLowerCase();
  if (!/^[a-z0-9_-]+:[a-z]+$/.test(normalized)) {
    throw new Error(`Malformed scope format: ${scope}`);
  }
  return normalized;
}

function assertValidAction(action: string): Action {
  const validActions: Action[] = ["create", "read", "update", "delete"];
  if (!validActions.includes(action as Action)) {
    throw new Error(`Invalid action: ${action}`);
  }
  return action as Action;
}

function assertValidCollection(collection: string): string {
  if (!/^[a-z0-9_-]+$/.test(collection)) {
    throw new Error(`Invalid collection name: ${collection}`);
  }
  return collection;
}

/**
 * --- Token Lifecycle ---
 */

export function generateAgentToken(
  userId: string,
  role: string,
  scopes: string[],
  expiresInSeconds: number = 600
): string {
  const normalizedScopes = scopes.map(normalizeScope);

  return jwt.sign(
    {
      sub: userId,
      role,
      scope: normalizedScopes,
      sessionId: crypto.randomUUID(),
    },
    getSecret(),
    {
      expiresIn: expiresInSeconds,
      issuer: "adminforge",
      audience: "agent",
    }
  );
}

/**
 * --- Verification & Enforcement ---
 */

// Stub for revocation capability
function isRevoked(sessionId: string): boolean {
  // In V1, we return false. V2 will check against a Redis/DB blacklist.
  return false;
}

export function verifyAgentToken(token: string): AgentTokenPayload {
  try {
    const payload = jwt.verify(token, getSecret(), {
      issuer: "adminforge",
      audience: "agent",
    }) as unknown as AgentTokenPayload;

    if (!payload.sub) throw new Error("Missing userId (sub)");
    if (!payload.role) throw new Error("Missing role");
    if (!Array.isArray(payload.scope)) throw new Error("Invalid scope format");

    if (isRevoked(payload.sessionId)) {
      throw new Error("Session revoked");
    }

    // Semantic normalization
    payload.scope = payload.scope.map(normalizeScope);

    return payload;
  } catch (error: any) {
    throw new Error(`Unauthorized: ${error.message}`);
  }
}

export function assertScope(agent: AgentSession, collection: string, action: Action): void {
  const validColl = assertValidCollection(collection);
  const validAction = assertValidAction(action);
  const key = `${validColl}:${validAction}`.toLowerCase();

  if (!agent.scope.includes(key)) {
    throw new Error(`Forbidden: Missing scope ${key}`);
  }
}

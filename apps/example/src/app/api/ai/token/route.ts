import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { generateAgentToken } from "adminforge/next";
import { config as adminForgeConfig } from "../../../../config/adminforge";

/**
 * Feature 1: Generate Agent Token
 * POST /api/ai/token
 */
export async function POST(req: Request) {
  try {
    // 1. Auth Requirement: User must be logged in
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scope, expiresIn = 600 } = await req.json();

    // 2. Validation Rules
    if (!Array.isArray(scope)) {
      return NextResponse.json({ error: "Scope must be an array" }, { status: 400 });
    }

    // 3. Verify Scopes are a subset of permissions (Basic V1 Check)
    // For V1, we ensure the collections exist. 
    // In V2, we'll cross-reference with the actual RBAC mapping.
    for (const s of scope) {
      const [collection, action] = s.split(":");
      const exists = adminForgeConfig.collections.find(c => c.name === collection);
      if (!exists) {
        return NextResponse.json({ error: `Invalid collection: ${collection}` }, { status: 400 });
      }
      if (!["create", "read", "update", "delete"].includes(action)) {
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
      }
    }

    // 4. Behavior: Generate Token
    // We infer userId and role from the session
    const userId = (session.user as any).id || session.user?.email;
    const role = (session as any).role || "admin"; 

    const token = generateAgentToken(userId, role, scope, expiresIn);

    // 5. Output: Return token ONCE
    return NextResponse.json({ token });

  } catch (error: any) {
    console.error("[TokenGen] Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

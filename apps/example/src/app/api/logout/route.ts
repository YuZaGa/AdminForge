import { NextRequest } from "next/server";
import { cookies } from "next/headers";

async function handleLogout(request: NextRequest) {
  const cookieStore = await cookies();
  const names = [
    "authjs.session-token",
    "next-auth.session-token",
    "__Secure-authjs.session-token",
    "__Secure-next-auth.session-token",
  ];
  for (const name of names) {
    cookieStore.delete(name);
  }
  const loginUrl = new URL("/admin/login", request.url);
  return Response.redirect(loginUrl, 302);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

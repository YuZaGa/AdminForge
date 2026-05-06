export function adminMiddleware(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const sessionCookie = request.headers.get("cookie") ?? "";
    const hasSession = sessionCookie.includes("next-auth.session-token");

    if (!hasSession) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request);
  };
}

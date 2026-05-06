import { auth } from "./lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth && pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return;
    const newUrl = new URL("/admin/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const USERS: Record<string, { password: string; role: string }> = {
  admin: { password: process.env.ADMIN_PASSWORD ?? "admin123", role: "admin" },
  editor: { password: process.env.EDITOR_PASSWORD ?? "editor123", role: "editor" },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const userKey = email.split("@")[0];
        const user = USERS[userKey];
        if (user && password === user.password) {
          return { id: userKey, email, name: userKey, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) (token as Record<string, unknown>).role = (user as Record<string, unknown>).role;
      return token;
    },
    session: ({ session, token }) => {
      (session as unknown as Record<string, unknown>).role = token.role;
      return session;
    },
    authorized: ({ auth: session }) => {
      return !!session?.user;
    },
  },
  pages: { signIn: "/admin/login" },
});

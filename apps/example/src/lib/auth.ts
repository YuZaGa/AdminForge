import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@adminforge.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

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

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { id: "1", email, name: "Admin" };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: async ({ auth: session }) => {
      return !!session?.user;
    },
  },
});

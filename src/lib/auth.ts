// src/lib/auth.ts
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Minimal NextAuth config so the /api/auth/[...nextauth] route can compile.
 * This is dev/demo only – real auth can come later.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Dev Login",
      credentials: {
        email: { label: "Work email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        if (!email) return null;

        // Simple dev user object
        return {
          id: email,
          email,
          name: email.split("@")[0],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

/**
 * Helper: get the current user on the server.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user;
}

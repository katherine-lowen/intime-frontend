// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export type CurrentUser = {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  org?: {
    id: string;
    name: string;
  };
};

/**
 * Minimal NextAuth config so that /api/auth/[...nextauth] can build.
 * You’re still using the Nest backend for real auth; this is just to satisfy
 * Next.js/TypeScript and keep the API route valid.
 */
export const authOptions: NextAuthOptions = {
  providers: [], // no interactive providers yet
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session }) {
      // You can later enrich this from your backend if you wire it up
      return session;
    },
  },
};

/**
 * Fetch the current user from the backend dev-auth endpoint.
 * This is safe to use in server components (pages, layouts, etc).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        "X-Org-Id": ORG_ID,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("getCurrentUser: /auth/me returned", res.status);
      return null;
    }

    const data = (await res.json()) as CurrentUser;
    if (!data?.user) return null;
    return data;
  } catch (err) {
    console.error("getCurrentUser: failed to call /auth/me", err);
    return null;
  }
}

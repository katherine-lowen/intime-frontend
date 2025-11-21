// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  org?: {
    id: string;
    name: string;
  };
};

/**
 * Minimal NextAuth config so that /api/auth/[...nextauth] can build.
 * Real auth still lives in your Nest backend; this just satisfies Next.js.
 */
export const authOptions: NextAuthOptions = {
  providers: [], // no browser auth providers wired up yet
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
};

/**
 * Fetch the current user from the backend dev-auth endpoint.
 * Normalizes the shape so pages can safely use `user.name`, `user.email`, etc.
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

    const raw = await res.json();

    // If backend returns { user: { ... }, org: { ... } }
    if (raw?.user) {
      const u = raw.user;
      return {
        id: u.id,
        email: u.email,
        name: u.name ?? "",
        role: u.role,
        org: raw.org
          ? {
              id: raw.org.id,
              name: raw.org.name,
            }
          : undefined,
      };
    }

    // If backend already returns a flat shape
    if (raw?.id && raw?.email) {
      return {
        id: raw.id,
        email: raw.email,
        name: raw.name ?? "",
        role: raw.role,
        org: raw.org,
      };
    }

    return null;
  } catch (err) {
    console.error("getCurrentUser: failed to call /auth/me", err);
    return null;
  }
}

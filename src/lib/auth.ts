// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

if (process.env.NODE_ENV === "production" && API_URL.includes("localhost")) {
  console.warn(
    "[auth] NEXT_PUBLIC_API_URL points to localhost in production. Update to https://api.hireintime.ai"
  );
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  org?: {
    id: string;
    name: string;
    slug?: string;
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
    const res = await fetch(`${API_URL}/me`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        return null;
      }
      if (res.status === 404) {
        console.warn("getCurrentUser: /me returned 404; treating as unauthenticated");
        return null;
      }
      console.error("getCurrentUser: /me returned", res.status);
      return null;
    }

    const raw = await res.json();

    // --- CASE 1: Backend returns { user: {...}, org: {...} }
    if (raw?.user) {
      const u = raw.user;

      const name =
        u.name ??
        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ??
        "";

      return {
        id: u.id,
        email: u.email,
        name,
        role: u.role,
            org: raw.org
              ? {
                  id: raw.org.id,
                  name: raw.org.name,
                  slug: raw.org.slug,
                }
              : undefined,
      };
    }

    // --- CASE 2: Backend returns flat user shape
    if (raw?.id && raw?.email) {
      const name =
        raw.name ??
        `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim() ??
        "";

      return {
        id: raw.id,
        email: raw.email,
        name,
        role: raw.role,
        org: raw.org
          ? {
              ...raw.org,
              slug: raw.org.slug ?? raw.org.id,
            }
          : undefined,
      };
    }

    return null;
  } catch (err) {
    console.error("getCurrentUser: failed to call /dev-auth/me", err);
    return null;
  }
}

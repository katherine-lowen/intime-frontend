// src/app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDevSession } from "@/components/dev-auth-gate";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
// Strip any trailing slashes so we never end up with //auth/dev-login
const API_URL = RAW_API_URL.replace(/\/+$/, "");
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@intime.local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we already have a dev session, go straight to dashboard
  useEffect(() => {
    const session = getDevSession();
    if (session) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/dev-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          orgId: ORG_ID,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        user?: { id?: string; email?: string | null; name?: string | null };
        orgId?: string;
      };

      // Store a simple dev session in localStorage for the dev-auth-gate
      const session = {
        email: data.user?.email ?? email,
        name: data.user?.name ?? email.split("@")[0],
        orgId: data.orgId ?? ORG_ID,
        createdAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem("intime_dev_session", JSON.stringify(session));
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Dev login failed:", err);
      setError(err?.message ?? "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-slate-900">Sign in to Intime</h1>
        <p className="mt-2 text-sm text-slate-500">
          Dev-only login. We&apos;ll treat this email as an admin in your demo org.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Signing in…" : "Sign in as admin"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-400">
          This is a local dev login only. We&apos;ll wire up real auth later.
        </p>
      </div>
    </div>
  );
}

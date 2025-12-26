// src/app/login/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => null);
      const orgSlug =
        data?.org?.slug || data?.orgSlug || data?.slug || data?.org?.id || data?.orgId || "";
      router.push(orgSlug ? `/org/${orgSlug}/getting-started` : "/org");
    } catch (err: any) {
      setError(err?.message || "Unable to reach the login service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-semibold text-white">
            IT
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Intime</div>
            <div className="text-[11px] text-slate-400">
              Early access · Demo login
            </div>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-slate-100">
          Sign in to your workspace
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          For this early demo, clicking sign in will take you straight into the
          product experience.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300">
              Work email
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Enter workspace"}
          </button>

          {error ? <p className="text-xs text-red-400">{error}</p> : null}

        </form>
      </div>
    </main>
  );
}

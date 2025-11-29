// src/app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "intime_user";

type DevUser = {
  id: string;
  email: string;
  name?: string | null;
  orgId: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already "logged in" (user in localStorage), bounce to dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        router.replace("/dashboard");
      }
    } catch {
      // ignore
    }
  }, [router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      setError("Please enter an email and password.");
      return;
    }

    setLoading(true);
    try {
      // Derive a simple display name from the email
      const beforeAt = email.split("@")[0] || "User";
      const niceName =
        beforeAt.includes(".")
          ? beforeAt
              .split(".")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ")
          : beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);

      const devUser: DevUser = {
        id: `dev-${Date.now()}`,
        email,
        name: niceName,
        orgId: "demo-org",
        role: "admin",
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_KEY, JSON.stringify(devUser));
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("[Login] Failed to store dev user:", err);
      setError("Something went wrong saving your session.");
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
              Early access · Dev login
            </div>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-slate-100">
          Sign in to your workspace
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          This is a temporary dev-only login. Any email &amp; password will work.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-rose-500/60 bg-rose-950/50 px-3 py-2 text-[11px] text-rose-100">
            {error}
          </div>
        )}

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
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-2 text-[11px] text-slate-500">
            For now, this creates a local dev session only. We&apos;ll wire real
            auth + Stripe-backed orgs next.
          </p>
        </form>
      </div>
    </main>
  );
}

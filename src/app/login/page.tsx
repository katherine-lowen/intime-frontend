// src/app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in on the backend, bounce to dashboard
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const me = await api.get<any>("/dev-auth/me");
        if (!cancelled && me) {
          router.replace("/dashboard");
        }
      } catch {
        // Not logged in yet — ignore
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      // Real dev-auth login — backend sets cookie/session
      await api.post("/dev-auth/login", { email });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[Login] Dev auth failed:", err);

      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Something went wrong. Please try again.";

      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("object can not be found")
      ) {
        setError(
          "This email isn't in your seeded dev users. Try demo@intime.dev or click Sign in again."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4">

      {/* ⚠️ TEMPORARY BUG MESSAGE */}
      <div className="absolute top-5 inset-x-0 flex justify-center">
        <div className="rounded-md bg-amber-500/20 border border-amber-400 px-4 py-2 text-xs text-amber-200 shadow-lg backdrop-blur-sm">
          ⚠️ Tiny login bug we're squashing!  
          If you see “Try again”, just click sign-in again — it works 🤝
        </div>
      </div>

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
          This uses dev-auth. Try a seeded user like{" "}
          <span className="font-mono">demo@intime.dev</span>.
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
              placeholder="demo@intime.dev"
              disabled={loading}
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
              disabled={loading}
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
            This calls your Nest <code>/dev-auth/login</code> and seeds a dev
            session cookie. Real multi-org auth coming next.
          </p>
        </form>
      </div>
    </main>
  );
}

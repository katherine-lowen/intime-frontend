// src/app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDevSession } from "@/components/dev-auth-gate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@intime.local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we already have a dev session, skip the login page
  useEffect(() => {
    const session = getDevSession();
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/dev-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (typeof window !== "undefined") {
        window.localStorage.setItem("intime_dev_session", JSON.stringify(data));
      }

      router.push("/dashboard");
    } catch (e: any) {
      console.error("Login failed", e);
      setError(e?.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Sign in to Intime</h1>
        <p className="mt-1 text-xs text-slate-500">
          Dev-only login. We&apos;ll treat this email as an admin in your demo org.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
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

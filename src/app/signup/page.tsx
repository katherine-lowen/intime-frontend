// src/app/signup/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const USER_KEY = "intime_user";

type SignupResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    orgId: string;
    role: string;
  };
};

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter an email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: fullName.trim() || undefined,
          orgName: orgName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Signup failed:", res.status, text);
        throw new Error(
          res.status === 400
            ? "That email may already be in use or the password is too short."
            : "Something went wrong creating your account."
        );
      }

      const json = (await res.json()) as SignupResponse;

      // Persist minimal user payload for the app (TopNav, etc.)
      if (typeof window !== "undefined") {
        const stored = {
          id: json.user.id,
          email: json.user.email,
          name: fullName.trim() || null,
          orgId: json.user.orgId,
          role: json.user.role,
          token: json.accessToken,
        };
        window.localStorage.setItem(USER_KEY, JSON.stringify(stored));
      }

      // After signup, send them to plan selection
      router.push("/choose-plan");
    } catch (err: any) {
      setError(err?.message || "Failed to create your Intime workspace.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Demo banner always at the very top of the page */}
      <DemoBanner />

      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          {/* Logo / brand */}
          <div className="mb-6 space-y-1 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-100">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Intime
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                HR Platform
              </span>
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-50">
              Create your Intime workspace
            </h1>
            <p className="text-xs text-slate-400">
              One place for people, recruiting, onboarding, and time off.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Your name
              </label>
              <input
                type="text"
                autoComplete="name"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Taylor Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Org name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Company / workspace name
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Acme, Inc."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                We&apos;ll use this to create your Intime workspace.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Work email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            >
              {submitting ? "Creating workspace…" : "Create workspace"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-sky-300 hover:text-sky-200"
              onClick={() => router.push("/login")}
            >
              Log in
            </button>
          </p>
        </div>
      </main>
    </>
  );
}

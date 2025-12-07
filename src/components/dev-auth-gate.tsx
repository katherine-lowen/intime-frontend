// src/components/dev-auth-gate.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "intime_user";

export type DevUser = {
  id: string;
  email: string;
  name?: string | null;
  orgId?: string;
  role?: string;
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DevUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DevUser;
        setUser(parsed);
      }
    } catch (e) {
      console.warn("[AuthGate] Failed to parse stored user", e);
    } finally {
      setReady(true);
    }
  }, []);

  // While we don't know yet, render nothing (avoids weird flashes/hydration issues)
  if (!ready) return null;

  // If no dev user, show the “you must sign in” card
  if (!user) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="mb-4">
            <h1 className="text-base font-semibold text-slate-100">
              Sign in to Intime
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              You need to log in before accessing your workspace.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              Go to login
            </button>

            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800"
            >
              Create a new workspace
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            For now this is dev-only auth — once you log in, we store your
            session in <code className="rounded bg-slate-800 px-1">localStorage</code>.
          </p>
        </div>
      </main>
    );
  }

  // Logged in → just render the page
  return <>{children}</>;
}

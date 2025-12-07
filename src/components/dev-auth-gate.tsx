// src/components/dev-auth-gate.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

type Props = {
  children: ReactNode;
};

export function AuthGate({ children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const u = await getCurrentUser();

        if (cancelled) return;

        if (!u) {
          // Not logged in → go to login
          router.replace("/login");
        } else {
          setUser(u);
        }
      } catch (err) {
        console.error("[AuthGate] Failed to load current user", err);
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // While we don't know yet, show a tiny loading state
  if (user === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs text-slate-300 shadow-xl">
          Checking your session…
        </div>
      </main>
    );
  }

  // If we got here, user is non-null (otherwise we’d have been redirected)
  return <>{children}</>;
}

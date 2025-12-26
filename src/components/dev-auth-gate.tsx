// src/components/dev-auth-gate.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type React from "react";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

const PUBLIC_ROUTES = new Set<string>([
  "/",
  "/login",
  "/signup",
  "/careers",
]);

const NO_ORG_ROUTE = "/no-org";

function isPublic(pathname: string | null) {
  if (!pathname) return false;
  if (PUBLIC_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/careers")) return true;
  return false;
}

const EMPLOYEE_HOME = "/employee";
const EMPLOYEE_ALLOWED_PREFIXES = [
  EMPLOYEE_HOME,
  "/employee/profile",
  "/employee/timeoff",
  "/employee/tasks",
  "/employee/reviews",
  "/employee/documents",
];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setChecking(true);
      const me = await getCurrentUser();
      if (cancelled) return;

      setUser(me);
      setChecking(false);
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // While checking, render a lightweight placeholder to avoid layout jumps
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking your session…
      </div>
    );
  }

  // If user exists (and org where required), render children
  return <>{children}</>;
}

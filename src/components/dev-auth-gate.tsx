// src/components/dev-auth-gate.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "intime_dev_session";
const LOGIN_PATH = "/login";

type DevSession = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
  org?: {
    id?: string;
    name?: string;
  };
  issuedAt?: string;
} | null;

export function getDevSession(): DevSession {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDevSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function useDevSession() {
  const [session, setSession] = useState<DevSession>(null);

  useEffect(() => {
    setSession(getDevSession());
  }, []);

  return session;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<DevSession>(null);

  useEffect(() => {
    const s = getDevSession();
    setSession(s);

    // Don't protect the login page itself
    if (!s && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) {
    // Small loading state while we decide if user is logged in
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs text-slate-500">Checking session…</div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ShieldQuestion, CheckCircle2 } from "lucide-react";

type Status = "ok" | "health-failed" | "sentry-missing";

export function DevStatusBanner() {
  if (process.env.NODE_ENV === "production") return null;

  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      let healthOk = false;
      try {
        const res = await fetch("/health");
        healthOk = res.ok;
      } catch {
        healthOk = false;
      }

      const hasSentry =
        !!process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND ||
        !!process.env.SENTRY_DSN_FRONTEND;

      if (cancelled) return;
      if (!healthOk) setStatus("health-failed");
      else if (!hasSentry) setStatus("sentry-missing");
      else setStatus("ok");
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) return null;

  if (status === "ok") {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        All systems nominal
      </div>
    );
  }

  if (status === "health-failed") {
    return (
      <div className="flex items-center gap-2 bg-rose-50 px-3 py-1 text-xs text-rose-700">
        <AlertCircle className="h-4 w-4" />
        Backend health check failed
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 text-xs text-amber-700">
      <ShieldQuestion className="h-4 w-4" />
      Sentry is not configured
    </div>
  );
}

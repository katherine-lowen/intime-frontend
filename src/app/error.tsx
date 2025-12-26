"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Root app error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-6 text-slate-50 shadow-xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-sky-400">
          Intime workspace
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          Something went off schedule.
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          We hit an unexpected error while loading your workspace. Your data is
          safe &mdash; this is just the app view.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            size="sm"
            onClick={() => {
              // Try to recover by re-rendering the segment
              reset();
            }}
          >
            Try again
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const org = (globalThis as any).__INTIME_ORG_SLUG__;
router.push(org ? `/org/${org}/dashboard` : "/dashboard");
            }}
          >
            Go to dashboard
          </Button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          If this keeps happening, you can refresh the page or contact us at{" "}
          <span className="font-mono text-slate-300">
            support@hireintime.ai
          </span>
          .
        </p>
      </div>
    </div>
  );
}

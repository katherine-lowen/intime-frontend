// src/app/jobs/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { getCurrentUser } from "@/lib/auth";
import { JobForm } from "../components/JobForm";

export default function NewJobPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const me = await getCurrentUser();
      if (!cancelled) {
        setRole((me?.role || "").toUpperCase());
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isEmployee = useMemo(
    () => !["OWNER", "ADMIN", "MANAGER"].includes(role ?? ""),
    [role]
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Hiring · New job
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Open a new role</h1>
              <p className="text-sm text-slate-600">
                Define the role details. We’ll send you to the pipeline after saving.
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              ← Back to jobs
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-40 rounded bg-slate-100" />
              <div className="h-32 rounded bg-slate-100" />
            </div>
          ) : isEmployee ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have permission to create jobs.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <JobForm mode="create" />
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

// src/app/jobs/[id]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { JobForm } from "../../components/JobForm";

type Job = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  employmentType?: string | null;
  seniority?: string | null;
  description?: string | null;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
};

export default function EditJobPage() {
  const params = useParams<{ id?: string }>();
  const jobId = params?.id;

  const [role, setRole] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEmployee = useMemo(
    () => !["OWNER", "ADMIN", "MANAGER"].includes((role || "").toUpperCase()),
    [role]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await getCurrentUser();
        if (!cancelled) setRole((me?.role || "").toUpperCase());

        if (!jobId) {
          setError("Missing job id.");
          setLoading(false);
          return;
        }

        const data = await api.get<Job>(`/jobs/${jobId}`);
        if (!cancelled) {
          setJob(data ?? null);
          if (!data) setError("Job not found.");
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[job edit] fetch failed", err);
          setError(err?.message || "Failed to load job.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Hiring · Edit job
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {job?.title || "Edit job"}
              </h1>
              <p className="text-sm text-slate-600">
                Update role details and save changes.
              </p>
            </div>
            <Link
              href={`/jobs/${jobId ?? ""}/pipeline`}
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              ← Back to pipeline
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-40 rounded bg-slate-100" />
              <div className="h-32 rounded bg-slate-100" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : isEmployee ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have permission to edit jobs.
            </div>
          ) : job ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <JobForm mode="edit" jobId={jobId} initialJob={job} />
            </div>
          ) : null}
        </div>
      </div>
    </AuthGate>
  );
}

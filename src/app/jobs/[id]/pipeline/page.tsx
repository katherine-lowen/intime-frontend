// src/app/jobs/[id]/pipeline/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { PipelineTab } from "../components/PipelineTab";

export const dynamic = "force-dynamic";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type Job = {
  id: string;
  title: string;
  status?: JobStatus;
  location?: string | null;
  department?: string | null;
  createdAt?: string;
  description?: string | null;
};

export default function JobPipelinePage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("Missing job id from route params.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 🔹 Your api client returns the data directly (no .data)
        const jobRes = await api.get<Job>(`/jobs/${jobId}`);
        setJob(jobRes ?? null);
      } catch (err) {
        console.error("[JobPipelinePage] error loading job:", err);
        setError("Something went wrong loading this job.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [jobId]);

  const hasHardError = !!error || (!loading && !job);

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

      <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Hiring · Pipeline
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {job?.title || (loading ? "Loading job…" : "Job not found")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Visual pipeline of candidates by stage for this role, including
              candidates added via AI resume match.
            </p>

            {!loading && job && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                {job.department && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {job.department}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {job.location}
                  </span>
                )}
                {job.status && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                    Status: {job.status}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to jobs
            </Link>
          </div>
        </section>

        {/* ERROR BANNER */}
        {hasHardError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error ?? "Job not found for this URL."}
          </div>
        )}

        {/* LOADING STATE */}
        {loading && !hasHardError && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            Loading pipeline…
          </div>
        )}

        {/* PIPELINE BOARD */}
        {!loading && !hasHardError && jobId && (
          <section>
            <PipelineTab jobId={jobId} />
          </section>
        )}
      </main>
    </div>
  );
}

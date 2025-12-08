// src/app/jobs/[id]/pipeline/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { PipelineTab } from "../components/PipelineTab";
import { AuthGate } from "@/components/dev-auth-gate";
import { getCurrentUser } from "@/lib/auth";

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

type Stage = { id: string; name: string; order: number };
type Candidate = {
  id: string;
  name?: string | null;
  email?: string | null;
  stageId: string;
  matchScore?: number | null;
  source?: string | null;
  appliedAt?: string | null;
};

type PipelineResponse = {
  job: Job;
  stages: Stage[];
  candidates: Candidate[];
};

export default function JobPipelinePage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      const me = await getCurrentUser();
      if (cancelled) return;
      const role = (me?.role || "").toUpperCase();
      setIsEmployee(!["OWNER", "ADMIN", "MANAGER"].includes(role));
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPipeline = async () => {
    if (!jobId) {
      setError("Missing job id from route params.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<PipelineResponse>(`/jobs/${jobId}/pipeline`);
      setPipeline(data ?? null);
      if (!data) setError("Pipeline not found.");
    } catch (err: any) {
      console.error("[JobPipelinePage] error loading pipeline:", err);
      setError(err?.message || "Something went wrong loading this job.");
      setPipeline(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const hasHardError = !!error || (!loading && !pipeline);
  const job = pipeline?.job;

  return (
    <AuthGate>
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
              {!isEmployee && jobId && (
                <>
                  <Link
                    href={`/jobs/${jobId}/edit`}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Edit job
                  </Link>
                  <Link
                    href={`/jobs/${jobId}/settings`}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Settings
                  </Link>
                </>
              )}
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
              <div className="mt-2">
                <button
                  onClick={fetchPipeline}
                  className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && !hasHardError && (
            <div className="space-y-4">
              <div className="h-20 rounded-2xl border border-slate-200 bg-slate-100" />
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-72 w-[260px] rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
              </div>
            </div>
          )}

          {/* PIPELINE BOARD */}
          {!loading && !hasHardError && pipeline && jobId && (
            <section>
              <PipelineTab
                jobId={jobId as string}
                job={pipeline.job}
                stages={pipeline.stages}
                candidates={pipeline.candidates}
                onReload={fetchPipeline}
                isEmployee={isEmployee}
              />
            </section>
          )}
        </main>
      </div>
    </AuthGate>
  );
}

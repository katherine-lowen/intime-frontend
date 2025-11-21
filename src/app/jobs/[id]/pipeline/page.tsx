// src/app/jobs/[id]/pipeline/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type CandidateStage =
  | "NEW"
  | "PHONE_SCREEN"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

type Job = {
  id: string;
  title: string;
  status?: JobStatus;
  location?: string | null;
  department?: string | null;
};

type Candidate = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  stage?: CandidateStage | null;
  status?: string | null;
  jobId?: string | null;
  createdAt?: string;
};

const STAGES: {
  id: CandidateStage;
  label: string;
  description: string;
}[] = [
  {
    id: "NEW",
    label: "New / Applied",
    description: "Fresh applicants from your careers page.",
  },
  {
    id: "PHONE_SCREEN",
    label: "Phone screen",
    description: "Initial recruiter / hiring manager screens.",
  },
  {
    id: "INTERVIEW",
    label: "Interviews",
    description: "Onsite / panel interviews in progress.",
  },
  {
    id: "OFFER",
    label: "Offer",
    description: "Verbal / written offers out for signature.",
  },
  {
    id: "HIRED",
    label: "Hired",
    description: "Accepted offers, ready for onboarding.",
  },
];

function getDisplayName(c: Candidate): string {
  if (c.firstName || c.lastName) {
    return `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unnamed";
  }
  return c.name || "Unnamed";
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobPipelinePage() {
const params = useParams<{ id: string }>();
const jobId = params?.id;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- LOAD DATA -------------------------------------------------------------

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
        const [jobRes, candidatesRes] = await Promise.all([
          api.get<Job>(`/jobs/${jobId}`),
          api.get<Candidate[]>(`/candidates?jobId=${jobId}`),
        ]);

        setJob(jobRes);
        setCandidates(candidatesRes ?? []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong loading this job.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [jobId]);

  // --- DERIVED STATE --------------------------------------------------------

  const columns = useMemo(() => {
    const base: Record<CandidateStage, Candidate[]> = {
      NEW: [],
      PHONE_SCREEN: [],
      INTERVIEW: [],
      OFFER: [],
      HIRED: [],
      REJECTED: [],
    };

    for (const c of candidates) {
      const stage = (c.stage as CandidateStage) || "NEW";
      if (!base[stage]) base.NEW.push(c);
      else base[stage].push(c);
    }

    return base;
  }, [candidates]);

  const totalVisible = useMemo(
    () =>
      STAGES.reduce((sum, stage) => {
        return sum + (columns[stage.id]?.length ?? 0);
      }, 0),
    [columns],
  );

  // --- RENDER ---------------------------------------------------------------

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
              {job?.title || "Job not found"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Visual pipeline of candidates by stage for this role.
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
                <span>
                  {totalVisible}{" "}
                  {totalVisible === 1 ? "candidate" : "candidates"} in view
                </span>
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

        {/* PIPELINE COLUMNS */}
        {!loading && !hasHardError && (
          <section className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-full">
              {STAGES.map((stage) => {
                const items = columns[stage.id] || [];
                return (
                  <div
                    key={stage.id}
                    className="flex min-w-[260px] max-w-xs flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* Column header */}
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-semibold text-slate-900">
                          {stage.label}
                        </div>
                        <div className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-700">
                          {items.length}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {stage.description}
                      </p>
                    </div>

                    {/* Column body */}
                    <div className="flex flex-1 flex-col gap-2 px-3 py-3">
                      {items.length === 0 && (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-[11px] text-slate-500">
                          No candidates in this stage.
                        </div>
                      )}

                      {items.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            router.push(`/candidates/${encodeURIComponent(c.id)}`)
                          }
                          className="group flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-[13px] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-medium text-slate-900">
                              {getDisplayName(c)}
                            </div>
                            {c.status && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {c.status}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {c.email || "No email provided"}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>
                              Stage:{" "}
                              <span className="font-medium text-slate-600">
                                {stage.label}
                              </span>
                            </span>
                            {c.createdAt && (
                              <span>Added {formatDate(c.createdAt)}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// src/app/jobs/jobs-client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type Job = {
  id: string;
  title: string;
  status?: JobStatus;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;
  applicantsCount?: number;
  publishToJobBoard?: boolean;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
};

type Candidate = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  stage?: string | null;
  status?: string | null;
  createdAt?: string;
};

const STAGE_CONFIG = [
  { key: "NEW", label: "New / Applied" },
  { key: "SCREEN", label: "Phone screen" },
  { key: "INTERVIEW", label: "Interviews" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
  { key: "ARCHIVED", label: "Archived" },
];

function extractJobId(pathname: string | null): string {
  const parts = (pathname ?? "").split("/").filter(Boolean);
  const jobsIndex = parts.indexOf("jobs");
  if (jobsIndex === -1) return "";
  return parts[jobsIndex + 1] ?? "";
}

function normalizeStage(raw?: string | null): string {
  if (!raw) return "NEW";
  const upper = raw.toUpperCase();

  if (upper.includes("SCREEN")) return "SCREEN";
  if (upper.includes("INTERVIEW")) return "INTERVIEW";
  if (upper.includes("OFFER")) return "OFFER";
  if (upper.includes("HIRE")) return "HIRED";
  if (
    upper.includes("ARCHIVE") ||
    upper === "REJECTED" ||
    upper === "DECLINED"
  ) {
    return "ARCHIVED";
  }

  return upper;
}

function formatComp(job: Job): string | null {
  const min = job.compensationMin ?? null;
  const max = job.compensationMax ?? null;
  const currency = job.compensationCurrency || "USD";

  if (min == null && max == null) return null;
  if (min != null && max != null) {
    return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
  }
  if (min != null) return `From ${currency} ${min.toLocaleString()}`;
  if (max != null) return `Up to ${currency} ${max.toLocaleString()}`;
  return null;
}

function getCandidateName(c: Candidate): string {
  if (c.firstName || c.lastName) {
    return `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unnamed";
  }
  return c.name || "Unnamed";
}

export default function JobsClient() {
  const pathname = usePathname();
  const jobId = extractJobId(pathname);

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("Missing job id in route.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [jobRes, candRes] = await Promise.all([
          api.get<Job>(`/jobs/${jobId}`),
          api.get<Candidate[]>(`/candidates?jobId=${jobId}`),
        ]);

        if (cancelled) return;
        setJob(jobRes);
        setCandidates(Array.isArray(candRes) ? candRes : []);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError("Something went wrong loading this job.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const candidatesByStage = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    for (const cand of candidates) {
      const key = normalizeStage(cand.stage);
      if (!map[key]) map[key] = [];
      map[key].push(cand);
    }
    return map;
  }, [candidates]);

  const totalApplicants = candidates.length;
  const createdLabel =
    job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—";
  const compLabel = job ? formatComp(job) : null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

      <main className="space-y-6 px-6 py-6">
        {/* HEADER */}
        <section className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Hiring · Pipeline
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {job ? job.title : loading ? "Loading role…" : "Job not found"}
            </h1>
            {job && (
              <p className="mt-1 text-sm text-slate-600">
                {[job.department, job.location]
                  .filter(Boolean)
                  .join(" · ") || "No department/location set"}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {job && (
                <>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    Status: {job.status ?? "DRAFT"}
                  </span>
                  <span>Opened {createdLabel}</span>
                  <span>{totalApplicants} applicants</span>
                  {job.publishToJobBoard && (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                      Published on job board
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {job && (
              <Link
                href={`/careers/${job.id}`}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                View public posting
              </Link>
            )}
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to jobs
            </Link>
            {job && (
              <Link
                href={`/jobs/${job.id}/edit`}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Edit job
              </Link>
            )}
          </div>
        </section>

        {/* TOP META STRIP */}
        {job && (
          <section className="mx-auto max-w-6xl">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                <div className="text-xs text-slate-500">Applicants</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {totalApplicants}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                <div className="text-xs text-slate-500">Compensation</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {compLabel || "Not set"}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                <div className="text-xs text-slate-500">Department</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {job.department || "Not set"}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                <div className="text-xs text-slate-500">Location</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {job.location || "Not set"}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ERRORS / LOADING */}
        {error && (
          <section className="mx-auto max-w-6xl">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          </section>
        )}

        {/* PIPELINE BOARD */}
        <section className="mx-auto max-w-6xl">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {loading && (
              <div className="text-sm text-slate-500">
                Loading candidates…
              </div>
            )}

            {!loading &&
              STAGE_CONFIG.map((stage) => {
                const list = candidatesByStage[stage.key] ?? [];
                return (
                  <div
                    key={stage.key}
                    className="flex min-w-[220px] max-w-xs flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                      <span>{stage.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                        {list.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 p-3">
                      {list.length === 0 && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          No candidates in this stage.
                        </p>
                      )}

                      {list.map((cand) => (
                        <div
                          key={cand.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs hover:border-indigo-200 hover:bg-indigo-50/60"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-medium text-slate-900">
                                {getCandidateName(cand)}
                              </div>
                              {cand.email && (
                                <div className="mt-0.5 text-[11px] text-slate-500">
                                  {cand.email}
                                </div>
                              )}
                            </div>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">
                              {cand.stage || "New"}
                            </span>
                          </div>
                          {cand.createdAt && (
                            <div className="mt-1 text-[10px] text-slate-400">
                              Added{" "}
                              {new Date(cand.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            {!loading && candidates.length === 0 && !error && (
              <div className="text-sm text-slate-500">
                No applicants yet. Share your public job link to start building
                this pipeline.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

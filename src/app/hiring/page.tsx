// src/app/hiring/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type Job = {
  id: string;
  title: string;
  status: JobStatus | string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;
  applicantsCount?: number;
};

type Candidate = {
  id: string;
  name?: string | null;
  email?: string | null;
  stage?: string | null;
  jobId?: string | null;
  job?: {
    id: string;
    title: string;
    department?: string | null;
  } | null;
  createdAt?: string;
};

async function getJobs(): Promise<Job[]> {
  // JobsController.list currently returns { page, limit, total, items }
  const res = await api.get<any>("/jobs?limit=1000");
  if (Array.isArray(res)) return res as Job[];
  if (Array.isArray(res?.items)) return res.items as Job[];
  return [];
}

async function getCandidates(): Promise<Candidate[]> {
  const res = await api.get<any>("/candidates");
  if (Array.isArray(res)) return res as Candidate[];
  return [];
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status: JobStatus | string) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "DRAFT":
      return "Draft";
    case "PAUSED":
      return "Paused";
    case "CLOSED":
      return "Closed";
    default:
      return String(status || "Open");
  }
}

export default async function HiringWorkspacePage() {
  let jobs: Job[] = [];
  let candidates: Candidate[] = [];

  try {
    [jobs, candidates] = await Promise.all([getJobs(), getCandidates()]);
  } catch (e) {
    console.error("Failed to load hiring workspace data", e);
  }

  const openJobs = jobs.filter((j) => j.status === "OPEN");
  const draftJobs = jobs.filter((j) => j.status === "DRAFT");
  const totalCandidates = candidates.length;

  const activePipelineCandidates = candidates.filter((c) => {
    const s = (c.stage || "").toLowerCase();
    if (!s) return false;
    // treat these as "in pipeline"
    return !["rejected", "hired", "withdrawn", "archived"].includes(s);
  });

  // Map jobId -> candidates[]
  const candidatesByJob = candidates.reduce<Record<string, Candidate[]>>(
    (acc, c) => {
      const key = c.jobId || c.job?.id;
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    },
    {},
  );

  const jobsWithApplicants = jobs.filter(
    (j) => (j.applicantsCount ?? candidatesByJob[j.id]?.length ?? 0) > 0,
  );

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Talent · Hiring</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Hiring workspace
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              A focused view of open roles, pipelines, and candidates across
              your company.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/jobs/new"
              className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              + Open new role
            </Link>
            <Link
              href="/candidates"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              View all candidates
            </Link>
          </div>
        </header>

        {/* METRICS STRIP */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Open roles</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {openJobs.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Jobs that are open and potentially on your public job board.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Candidates in pipeline</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {activePipelineCandidates.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Excludes candidates marked rejected, hired, or archived.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Jobs with applicants</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {jobsWithApplicants.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              At least one candidate tied to the requisition.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total candidates</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {totalCandidates}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              All candidates in your ATS, across roles.
            </p>
          </div>
        </section>

        {/* MAIN LAYOUT */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
          {/* JOBS TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Requisitions
              </h2>
              <span className="text-[11px] text-slate-500">
                {jobs.length} total job
                {jobs.length === 1 ? "" : "s"}
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">
                No jobs yet.{" "}
                <Link
                  href="/jobs/new"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Open your first requisition
                </Link>{" "}
                to start hiring.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Dept</th>
                      <th className="px-4 py-2 text-left">Location</th>
                      <th className="px-4 py-2 text-left">Candidates</th>
                      <th className="px-4 py-2 text-left">Opened</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const count =
                        job.applicantsCount ??
                        candidatesByJob[job.id]?.length ??
                        0;
                      const statusLabel = formatStatus(job.status);

                      let statusClass =
                        "bg-slate-100 text-slate-700 border-slate-200";
                      if (job.status === "OPEN") {
                        statusClass =
                          "bg-emerald-50 text-emerald-700 border-emerald-100";
                      } else if (job.status === "DRAFT") {
                        statusClass =
                          "bg-slate-100 text-slate-700 border-slate-200";
                      } else if (job.status === "PAUSED") {
                        statusClass =
                          "bg-amber-50 text-amber-700 border-amber-100";
                      } else if (job.status === "CLOSED") {
                        statusClass =
                          "bg-slate-50 text-slate-500 border-slate-100";
                      }

                      return (
                        <tr
                          key={job.id}
                          className="border-b last:border-b-0 hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-2">
                            <div className="font-medium text-slate-900">
                              {job.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {job.description
                                ? job.description.slice(0, 80) +
                                  (job.description.length > 80 ? "…" : "")
                                : "No description yet"}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {job.department || "—"}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {job.location || "—"}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-700">
                            {count === 0 ? (
                              <span className="text-slate-400">No candidates</span>
                            ) : (
                              <>
                                {count} candidate{count === 1 ? "" : "s"}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {formatDate(job.createdAt)}
                          </td>
                          <td className="px-4 py-2 text-right text-xs">
                            <div className="inline-flex gap-2">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-indigo-600 hover:underline"
                              >
                                Open
                              </Link>
                              <Link
                                href={`/jobs/${job.id}/edit`}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT RAIL: quick actions & pipeline */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Quick actions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Spin up new requisitions or jump to candidates in one click.
              </p>

              <div className="mt-3 space-y-2 text-xs">
                <Link
                  href="/jobs/new"
                  className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <span>+ Open a new role</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/candidates"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span>View all candidates</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/careers"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Preview public job board</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Pipeline snapshot
              </h2>
              {activePipelineCandidates.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  No candidates currently in active stages. As applications come
                  in and you move people through the process, you&apos;ll see
                  them here.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-xs">
                  {activePipelineCandidates.slice(0, 6).map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">
                          {c.name || c.email || "Candidate"}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                          {c.job?.title || "Unassigned role"}
                          {c.stage ? ` • ${c.stage}` : ""}
                        </div>
                      </div>
                      <Link
                        href="/candidates"
                        className="text-[11px] font-medium text-indigo-600 hover:underline"
                      >
                        Open
                      </Link>
                    </li>
                  ))}

                  {activePipelineCandidates.length > 6 && (
                    <li className="text-right text-[11px]">
                      <Link
                        href="/candidates"
                        className="text-indigo-600 hover:underline"
                      >
                        View all pipeline candidates →
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}

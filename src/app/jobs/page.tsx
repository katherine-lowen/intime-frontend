// src/app/jobs/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { API_BASE_URL } from "@/lib/api";
import { JobsTableSkeleton } from "./components/JobsTableSkeleton";

export const dynamic = "force-dynamic";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "";

type Job = {
  id?: string;        // may be missing in some API responses
  jobId?: string;     // fallback for older API responses
  title: string;
  status: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;
  applicantsCount?: number;
};

type JobsApiResponse =
  | Job[]
  | {
      items?: Job[];
      data?: Job[];
      jobs?: Job[];
      total?: number;
      page?: number;
      limit?: number;
      pages?: number;
    };

async function getJobs(): Promise<{ jobs: Job[]; error?: string }> {
  try {
    const headers: HeadersInit = {};
    // Only send org header if we actually have one configured
    if (ORG_ID) {
      headers["x-org-id"] = ORG_ID;
    }

    const res = await fetch(`${API_BASE_URL}/jobs?limit=100`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to load /jobs", res.status, text);
      return { jobs: [], error: `API responded with ${res.status}` };
    }

    const data: JobsApiResponse = await res.json();

    if (Array.isArray(data)) return { jobs: data };

    const maybeJobs =
      (Array.isArray((data as any).items) && (data as any).items) ||
      (Array.isArray((data as any).data) && (data as any).data) ||
      (Array.isArray((data as any).jobs) && (data as any).jobs);

    if (Array.isArray(maybeJobs)) return { jobs: maybeJobs };

    return { jobs: [], error: "Unexpected jobs response shape" };
  } catch (err) {
    console.error("Failed to load /jobs", err);
    return { jobs: [], error: "Network or API error loading jobs" };
  }
}

function isOpen(status: string | undefined) {
  return status?.toUpperCase() === "OPEN";
}

// Normalize IDs so undefined / "undefined" → empty string
function normalizeId(raw?: string | null): string {
  if (!raw) return "";
  if (raw === "undefined") return "";
  return raw;
}

export default async function JobsPage() {
  const { jobs, error } = await getJobs();
  const openCount = jobs.filter((j) => isOpen(j.status)).length;

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Header */}
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hiring
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Jobs
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track open roles, their status, and active requisitions.
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Open new requisition
          </Link>
        </section>

        {/* Snapshot */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total roles</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {jobs.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Open</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {openCount}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Closed / draft</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {jobs.length - openCount}
            </div>
          </div>
        </section>

        {/* Error banner (if API failed) */}
        {error && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            There was a problem loading jobs from the API.{" "}
            <span className="font-mono">({error})</span>
          </section>
        )}

        {/* Table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">All jobs</h2>
            <span className="text-[11px] text-slate-500">
              {jobs.length} role{jobs.length === 1 ? "" : "s"}
            </span>
          </div>

          {jobs.length === 0 ? (
            error ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  We couldn’t load any jobs. Check your API URL and org configuration.
                </p>
                <button
                  onClick={() => location.reload()}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Retry
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No jobs yet. Click "Open new requisition" to add your first role.
              </p>
            )
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Applicants</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {jobs.map((job) => {
                    const rawId = job.id ?? job.jobId ?? "";
                    const effectiveId = normalizeId(rawId);

                    return (
                      <tr
                        key={effectiveId || job.title}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-2">
                          {effectiveId ? (
                            <Link
                              href={`/jobs/${effectiveId}`}
                              className="font-medium text-slate-900 hover:underline"
                            >
                              {job.title}
                            </Link>
                          ) : (
                            <span className="font-medium text-slate-400">
                              {job.title} (no id)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2 text-slate-600">
                          {job.department || "—"}
                        </td>

                        <td className="px-4 py-2 text-slate-600">
                          {job.location || "—"}
                        </td>

                        <td className="px-4 py-2 text-xs">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {job.status || "DRAFT"}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-right text-slate-600">
                          {job.applicantsCount ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}

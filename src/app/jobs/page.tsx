// src/app/jobs/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

type Job = {
  id: string;
  title: string;
  status: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;
  applicantsCount?: number;
};

type JobsListResponse = {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

async function getJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API_URL}/jobs?limit=100`, {
      cache: "no-store", // 🚫 no caching – always hit backend
      headers: {
        "x-org-id": ORG_ID,
      },
    });

    if (!res.ok) {
      console.error("Failed to load /jobs", res.status, await res.text());
      return [];
    }

    const data: JobsListResponse | Job[] = await res.json();

    if (Array.isArray(data)) {
      // backend returns a plain array
      return data;
    }

    if (data && Array.isArray(data.data)) {
      // backend returns paginated shape
      return data.data;
    }

    return [];
  } catch (err) {
    console.error("Failed to load /jobs", err);
    return [];
  }
}

export default async function JobsPage() {
  const jobs = await getJobs();

  const openCount = jobs.filter((j) => j.status === "OPEN").length;

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

        {/* Table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">All jobs</h2>
            <span className="text-[11px] text-slate-500">
              {jobs.length} role{jobs.length === 1 ? "" : "s"}
            </span>
          </div>

          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500">
              No jobs yet. Click &quot;Open new requisition&quot; to add your
              first role.
            </p>
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
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {job.title}
                        </Link>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}

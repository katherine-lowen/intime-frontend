import Link from "next/link";
import { fetchJobsForOrg } from "@/lib/api-jobs";

type PageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function JobsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const jobs = await fetchJobsForOrg(orgSlug);

  const openCount = jobs.filter((j) => (j.status ?? "").toUpperCase() === "OPEN")
    .length;
  const closedCount = jobs.filter(
    (j) => (j.status ?? "").toUpperCase() === "CLOSED"
  ).length;

  const firstJobId = jobs[0]?.id;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Unified ATS for every role, stage and candidate.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {firstJobId ? (
            <Link
              href={`/org/${orgSlug}/jobs/${firstJobId}/pipeline`}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              View pipeline
            </Link>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-400"
              title="Create a job first"
            >
              View pipeline
            </button>
          )}

          <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50">
            View careers site
          </button>

          <button className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-black">
            Create job
          </button>
        </div>
      </header>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open roles" value={openCount} helper="Actively hiring" />
        <Kpi label="Closed roles" value={closedCount} helper="Archived roles" />
        <Kpi label="Total roles" value={jobs.length} helper="All roles" />
        <Kpi label="Next step" value="Pipeline" helper="Kanban from stages + apps" />
      </section>

      {/* Jobs table */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Roles</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {jobs.length === 0
                ? "No jobs yet. Create your first role to start hiring."
                : `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"} in this org.`}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Live: <span className="font-medium">/org/{orgSlug}/jobs</span>
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-xs text-slate-500">
            <p>Once you create jobs, they&apos;ll show up here.</p>
            <p className="text-[11px] text-slate-400">
              Next: view a job pipeline → stages + candidates.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="min-w-full border-collapse bg-white text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5 hidden sm:table-cell">Department</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Location</th>
                  <th className="px-4 py-2.5 hidden lg:table-cell">Status</th>
                  <th className="px-4 py-2.5 hidden lg:table-cell">Opened</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {jobs.map((job) => {
                  const status = (job.status ?? "OPEN").toUpperCase();
                  const statusLabel = status === "CLOSED" ? "Closed" : "Open";

                  const statusClasses =
                    status === "CLOSED"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-indigo-50 text-indigo-700";

                  const opened =
                    job.createdAt &&
                    !Number.isNaN(Date.parse(job.createdAt)) &&
                    new Date(job.createdAt).toLocaleDateString();

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-900">
                            {job.title || "Untitled role"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ID: {job.id.slice(0, 8)}…
                          </span>

                          <Link
                            href={`/org/${orgSlug}/jobs/${job.id}/pipeline`}
                            className="mt-1 inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                          >
                            View pipeline →
                          </Link>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle hidden sm:table-cell">
                        {job.department || "—"}
                      </td>

                      <td className="px-4 py-3 align-middle hidden md:table-cell">
                        {job.location || "—"}
                      </td>

                      <td className="px-4 py-3 align-middle hidden lg:table-cell">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClasses}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle hidden lg:table-cell">
                        <span className="text-xs text-slate-600">
                          {opened || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle text-right">
                        <Link
                          href={`/org/${orgSlug}/jobs/${job.id}/pipeline`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                        >
                          Open pipeline
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pipeline teaser */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Hiring pipeline
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Click “View pipeline” on any role to see the Kanban powered by your
              pipeline data.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Backend: <span className="font-medium">/org/:orgSlug/jobs/:jobId/pipeline</span>
          </p>
        </div>

        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-xs text-slate-500">
          Next: add drag-and-drop + stage move actions (later).
        </div>
      </section>
    </div>
  );
}

function Kpi(props: { label: string; value: number | string; helper?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {props.label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{props.value}</p>
      {props.helper && (
        <p className="mt-2 text-xs text-slate-500">{props.helper}</p>
      )}
    </div>
  );
}

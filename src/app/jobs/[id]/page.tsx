// src/app/jobs/[id]/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type Job = {
  id: string;
  title: string;
  status: JobStatus;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;

  // Requisition / job board fields
  publishToJobBoard?: boolean;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
  compensationNotes?: string | null;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

async function getJob(id: string): Promise<Job> {
  return api.get<Job>(`/jobs/${id}`);
}

async function getJobEvents(id: string): Promise<EventItem[]> {
  // backend already supports ?jobId filter on /events
  return api.get<EventItem[]>(`/events?jobId=${id}`);
}

function statusBadge(status: JobStatus) {
  const normalized = status.toUpperCase();
  let label = normalized;
  let className =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium";

  switch (normalized) {
    case "OPEN":
      label = "Open";
      className += " bg-emerald-50 text-emerald-700 border border-emerald-100";
      break;
    case "DRAFT":
      label = "Draft";
      className += " bg-slate-50 text-slate-700 border border-slate-200";
      break;
    case "PAUSED":
      label = "Paused";
      className += " bg-amber-50 text-amber-700 border border-amber-100";
      break;
    case "CLOSED":
      label = "Closed";
      className += " bg-rose-50 text-rose-700 border border-rose-100";
      break;
    default:
      className += " bg-slate-50 text-slate-700 border border-slate-200";
  }

  return <span className={className}>{label}</span>;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatComp(job: Job) {
  const { compensationMin, compensationMax, compensationCurrency } = job;
  if (compensationMin == null && compensationMax == null) return "Not set";

  const currency = compensationCurrency || "USD";
  if (compensationMin != null && compensationMax != null) {
    return `${currency} ${compensationMin.toLocaleString()}–${compensationMax.toLocaleString()} (annual)`;
  }
  if (compensationMin != null) {
    return `${currency} ${compensationMin.toLocaleString()}+ (annual)`;
  }
  return `${currency} up to ${compensationMax!.toLocaleString()} (annual)`;
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [job, events] = await Promise.all([getJob(id), getJobEvents(id)]);

  const publicJobUrl = `/careers/${job.id}`; // frontend public job route (we can wire the real one later)

  return (
    <AuthGate>
      <div className="relative min-h-screen">
        {/* background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-slate-50" />

        <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          {/* Header */}
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Link
                  href="/jobs"
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 hover:bg-slate-50"
                >
                  ← All jobs
                </Link>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Requisition</span>
                <span className="text-slate-400">/</span>
                <span className="font-medium text-slate-700">
                  {job.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {statusBadge(job.status)}
                {job.department && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{job.department}</span>
                  </>
                )}
                {job.location && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{job.location}</span>
                  </>
                )}
                {job.createdAt && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Opened {formatDate(job.createdAt)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right text-[11px] text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-800">
                  {job.status === "OPEN"
                    ? "Accepting applicants"
                    : "Not accepting applicants"}
                </span>
              </div>
              {job.publishToJobBoard && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  Published on public careers
                </span>
              )}
            </div>
          </section>

          {/* Two-column layout */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.4fr)]">
            {/* Left: role details */}
            <div className="space-y-4">
              {/* About the role */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Role overview
                  </div>
                </div>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Department
                    </dt>
                    <dd className="mt-0.5 text-slate-900">
                      {job.department || "Not specified"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Location
                    </dt>
                    <dd className="mt-0.5 text-slate-900">
                      {job.location || "Not specified"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Compensation band
                    </dt>
                    <dd className="mt-0.5 text-slate-900">
                      {formatComp(job)}
                    </dd>
                    {job.compensationNotes && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {job.compensationNotes}
                      </p>
                    )}
                  </div>
                </dl>
              </div>

              {/* JD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Job description
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Internal view
                  </span>
                </div>
                {job.description ? (
                  <div className="prose prose-sm max-w-none text-slate-800">
                    <p className="whitespace-pre-line">{job.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No description provided yet. You can paste your JD into this
                    field when editing the requisition.
                  </p>
                )}
              </div>
            </div>

            {/* Right: public link + activity */}
            <div className="space-y-4">
              {/* Public job link */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Public job link
                  </div>
                  <span className="text-[11px] text-slate-500">
                    For candidates &amp; referrals
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Share this link with candidates. When this role is published
                  to your job board, applicants will be able to apply directly
                  here.
                </p>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 break-all">
                  {publicJobUrl}
                </div>

                {!job.publishToJobBoard && (
                  <p className="mt-2 text-[11px] text-amber-600">
                    This role is currently <span className="font-semibold">not</span>{" "}
                    marked as published. Enable &ldquo;Publish to job board&rdquo; on
                    the requisition to show it on your careers page.
                  </p>
                )}
              </div>

              {/* Activity for this role */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Activity for this role
                  </div>
                  <span className="text-[11px] text-slate-500">
                    From your unified events
                  </span>
                </div>

                {events.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No events logged for this role yet. As candidates move
                    through the pipeline, hires are made, or changes occur,
                    they&apos;ll show up here.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {events.slice(0, 10).map((e) => (
                      <li
                        key={e.id}
                        className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-slate-700">
                            {e.type}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatDate(e.createdAt)}
                          </span>
                        </div>
                        {e.summary && (
                          <p className="mt-0.5 text-[11px] text-slate-600">
                            {e.summary}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                          {e.source}
                        </p>
                      </li>
                    ))}
                    {events.length > 10 && (
                      <li className="text-[11px] text-slate-500">
                        +{events.length - 10} more events for this role
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthGate>
  );
}

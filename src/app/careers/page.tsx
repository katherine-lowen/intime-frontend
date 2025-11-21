// src/app/careers/page.tsx
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type PublicJob = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;
};

type PageProps = {
  searchParams?: {
    q?: string | string[];
    dept?: string | string[];
    loc?: string | string[];
  };
};

async function fetchJobs(): Promise<PublicJob[]> {
  try {
    const res = await fetch(`${API_URL}/careers/jobs`, {
      headers: {
        "X-Org-Id": ORG_ID,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to load careers jobs", res.status, res.statusText);
      return [];
    }

    const data = (await res.json()) as PublicJob[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch (err) {
    console.error("Error fetching careers jobs", err);
    return [];
  }
}

function toStringParam(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function formatPosted(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function CareersPage({ searchParams }: PageProps) {
  const jobs = await fetchJobs();

  const q = toStringParam(searchParams?.q).trim();
  const dept = toStringParam(searchParams?.dept).trim();
  const loc = toStringParam(searchParams?.loc).trim();

  // Build filter option lists from the data
  const departments = Array.from(
    new Set(
      jobs
        .map((j) => (j.department || "").trim())
        .filter((v) => v && v.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  const locations = Array.from(
    new Set(
      jobs
        .map((j) => (j.location || "").trim())
        .filter((v) => v && v.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Apply filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q.toLowerCase()) ||
      (job.description ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (job.department ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (job.location ?? "").toLowerCase().includes(q.toLowerCase());

    const matchesDept = !dept || (job.department || "").trim() === dept;
    const matchesLoc = !loc || (job.location || "").trim() === loc;

    return matchesSearch && matchesDept && matchesLoc;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Header / Hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            We&apos;re hiring
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
              Intime Careers
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Come build the future of time-aware HR.
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              We&apos;re a small, product-obsessed team building an HR platform
              that understands people, time, and context. Explore our open roles
              and apply in a few minutes—no logins, no ATS maze.
            </p>
          </div>
        </header>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <form
            method="GET"
            className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          >
            {/* Search */}
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="q"
                className="text-[11px] font-medium uppercase tracking-wide text-slate-500"
              >
                Search roles
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Search by title, team, or keywords"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Department */}
            <div className="min-w-[160px] space-y-1.5">
              <label
                htmlFor="dept"
                className="text-[11px] font-medium uppercase tracking-wide text-slate-500"
              >
                Department
              </label>
              <select
                id="dept"
                name="dept"
                defaultValue={dept}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All teams</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="min-w-[160px] space-y-1.5">
              <label
                htmlFor="loc"
                className="text-[11px] font-medium uppercase tracking-wide text-slate-500"
              >
                Location
              </label>
              <select
                id="loc"
                name="loc"
                defaultValue={loc}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Update results
              </button>
            </div>
          </form>
        </section>

        {/* Results */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {filteredJobs.length} open role
              {filteredJobs.length === 1 ? "" : "s"}
              {q || dept || loc ? " matching your filters" : ""}
            </span>
            <span className="hidden sm:inline">
              Don&apos;t see a fit? Reach out anyway—great people don&apos;t
              always fit a JD.
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
              <p className="font-medium text-slate-700">
                No open roles match your filters right now.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try clearing your filters, or check back soon as we open new
                positions.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredJobs.map((job) => (
                <li
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">
                          {job.title}
                        </h2>
                        {job.department && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                            {job.location}
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="line-clamp-2 text-xs text-slate-600">
                          {job.description}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        {job.createdAt && (
                          <>Posted {formatPosted(job.createdAt)}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col md:items-end md:justify-between">
                      <Link
                        href={`/careers/${job.id}`}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-50 hover:bg-slate-800"
                      >
                        View role &amp; apply →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

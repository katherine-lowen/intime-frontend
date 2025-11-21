// src/app/careers/[slug]/jobs/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type JobSummary = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;
};

async function getJobs(): Promise<JobSummary[]> {
  try {
    // Backend: CareersController.listJobs -> GET /careers/jobs
    const jobs = await api.get<JobSummary[]>("/careers/jobs");
    if (!Array.isArray(jobs)) return [];
    return jobs;
  } catch (err) {
    console.error("Failed to load public careers jobs", err);
    return [];
  }
}

function formatCompanyFromSlug(slug: string): string {
  // e.g. "nerdio-careers" -> "Nerdio"
  const cleaned = slug.replace(/-careers$/i, "");
  return cleaned
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ") || "Your company";
}

export default async function CareersJobsPage({
  params,
}: {
  params: { slug: string };
}) {
  const jobs = await getJobs();
  const companyName = formatCompanyFromSlug(params.slug);

  const total = jobs.length;

  // Group jobs by department
  const groups = jobs.reduce<Record<string, JobSummary[]>>((acc, job) => {
    const key = job.department?.trim() || "Other roles";
    if (!acc[key]) acc[key] = [];
    acc[key].push(job);
    return acc;
  }, {});

  const groupEntries = Object.entries(groups).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Header / hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {companyName} · Careers
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Join {companyName}
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Browse open roles across the team. Apply in a few minutes with
              your resume and basic details – no long forms, no logins.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm border border-slate-200">
              {total === 0
                ? "No open roles right now"
                : `${total} open role${total === 1 ? "" : "s"}`}
            </span>
            <span>Fast apply · No account required</span>
          </div>
        </header>

        {/* Main layout */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)]">
          {/* Job list */}
          <div className="space-y-4">
            {total === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
                <p className="font-medium text-slate-900">
                  No open roles at the moment.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {companyName} isn&apos;t hiring for any specific roles right
                  now. Check back soon or follow the team on LinkedIn to hear
                  when new opportunities open up.
                </p>
              </div>
            ) : (
              groupEntries.map(([department, deptJobs]) => (
                <div
                  key={department}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {department}
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      {deptJobs.length} role
                      {deptJobs.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {deptJobs.map((job) => (
                      <li key={job.id} className="py-3 first:pt-0 last:pb-0">
                        <Link
                          href={`/careers/${params.slug}/jobs/${job.id}`}
                          className="group flex flex-col gap-1 rounded-lg px-1 py-1 hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                                {job.title}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500">
                                {job.location || "Location flexible"}
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-indigo-600 opacity-0 group-hover:opacity-100">
                              View role →
                            </span>
                          </div>

                          {job.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {job.description}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Right rail / explainer */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                How hiring works
              </h3>
              <ol className="mt-2 space-y-2 text-xs text-slate-600">
                <li>
                  <span className="font-semibold text-slate-900">
                    1. Apply in minutes
                  </span>
                  <br />
                  Share your basic info, resume, and a few short answers.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">
                    2. Quick review
                  </span>
                  <br />
                  The team reviews applications continuously and reaches out if
                  there&apos;s a fit.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">
                    3. Streamlined process
                  </span>
                  <br />
                  A focused set of interviews to understand skills, impact, and
                  mutual fit.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-50 shadow-sm">
              <h3 className="text-sm font-semibold">
                Don&apos;t see the right role?
              </h3>
              <p className="mt-1 text-xs text-slate-200">
                Many hires start as conversations. If you&apos;re excited about{" "}
                {companyName}, consider reaching out with a short note on what
                you&apos;d like to work on.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

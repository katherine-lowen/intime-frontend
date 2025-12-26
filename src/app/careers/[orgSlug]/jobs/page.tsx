import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

type PublicJob = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
};

async function fetchPublicJobs(orgSlug: string): Promise<PublicJob[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/careers/jobs?org=${encodeURIComponent(orgSlug)}`,
      {
        headers: { "x-org-id": orgSlug },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as PublicJob[]) : [];
  } catch {
    return [];
  }
}

export default async function PublicJobsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const jobs = await fetchPublicJobs(orgSlug);
  const grouped = jobs.reduce<Record<string, PublicJob[]>>((acc, job) => {
    const dept = job.department?.trim() || "Open roles";
    acc[dept] = acc[dept] || [];
    acc[dept].push(job);
    return acc;
  }, {});

  const entries = Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Careers
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Open roles
          </h1>
          <p className="text-sm text-slate-600">
            Explore current openings. No account required to apply.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">No open roles</p>
            <p className="mt-1 text-xs text-slate-500">
              This team isn&apos;t hiring for specific roles right now. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {entries.map(([dept, deptJobs]) => (
              <section
                key={dept}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">{dept}</h2>
                  <span className="text-[11px] text-slate-500">
                    {deptJobs.length} role{deptJobs.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {deptJobs.map((job) => (
                    <li key={job.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/careers/${orgSlug}/jobs/${job.id}`}
                        className="group flex flex-col gap-1 rounded-lg px-1 py-1 hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                              {job.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {job.location || "Location flexible"}
                            </p>
                          </div>
                          <span className="text-[11px] font-medium text-indigo-600 opacity-0 group-hover:opacity-100">
                            View →
                          </span>
                        </div>
                        {job.description && (
                          <p className="line-clamp-2 text-xs text-slate-600">
                            {job.description}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

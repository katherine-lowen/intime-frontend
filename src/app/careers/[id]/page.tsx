// src/app/careers/[id]/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type PublicJob = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string | null;
};

async function getJob(id: string): Promise<PublicJob> {
  return api.get<PublicJob>(`/careers/jobs/${id}`);
}

export default async function PublicJobPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await getJob(params.id);

  const postedDate = job.createdAt ? new Date(job.createdAt) : null;
  const prettyDate =
    postedDate && !Number.isNaN(postedDate.getTime())
      ? postedDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Careers
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                Powered by Intime
              </span>
            </p>
            <Link
              href="/careers"
              className="mt-1 inline-flex items-center text-xs text-slate-500 hover:text-slate-700"
            >
              ← View all open roles
            </Link>
          </div>

          <Link
            href={`/careers/${job.id}/apply`}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-50 shadow-sm hover:bg-slate-800"
          >
            Apply for this role
          </Link>
        </div>
      </header>

      {/* Main layout */}
      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Left: job content */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
              {job.department && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                  {job.department}
                </span>
              )}
              {job.location && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">
                  {job.location}
                </span>
              )}
              {prettyDate && (
                <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1">
                  Posted {prettyDate}
                </span>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100" />

          <article className="space-y-3 text-sm leading-relaxed text-slate-800">
            {job.description ? (
              // Simple rendering – we assume plain text or basic HTML
              <p className="whitespace-pre-line">{job.description}</p>
            ) : (
              <p className="text-slate-500">
                The hiring team hasn&apos;t added a full description yet. This
                role is still open for applications.
              </p>
            )}
          </article>
        </section>

        {/* Right: quick facts + CTA */}
        <aside className="space-y-4 lg:pt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              About this role
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              A quick snapshot of the basics before you apply.
            </p>

            <dl className="mt-4 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Team</dt>
                <dd className="font-medium">
                  {job.department || "Not specified"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Location</dt>
                <dd className="font-medium">
                  {job.location || "Remote / flexible"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Posted</dt>
                <dd className="font-medium">
                  {prettyDate || "Recently posted"}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <Link
                href={`/careers/${job.id}/apply`}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-50 shadow-sm hover:bg-slate-800"
              >
                Start application
              </Link>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              You&apos;ll be able to share your resume, a quick intro, and
              answer a few short questions. No login required.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs font-semibold text-slate-900">
              Hiring process
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] text-slate-600">
              <li>Quick review by the hiring team</li>
              <li>Intro conversation if there&apos;s a match</li>
              <li>Role-specific interviews</li>
              <li>Offer &amp; onboarding</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}

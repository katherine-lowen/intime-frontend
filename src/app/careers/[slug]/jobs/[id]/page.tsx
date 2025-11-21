import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type Job = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
};

async function getJob(id: string): Promise<Job | null> {
  try {
    const job = await api.get<Job>(`/careers/jobs/${id}`);
    return job;
  } catch (err) {
    console.error("Failed to load public job", err);
    return null;
  }
}

function formatCompanyFromSlug(slug: string): string {
  const cleaned = slug.replace(/-careers$/i, "");
  return cleaned
    .split("-")
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ");
}

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const job = await getJob(params.id);
  const companyName = formatCompanyFromSlug(params.slug);

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-lg font-semibold text-slate-900">Role not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This role may have been closed or unpublished.
          </p>
          <Link
            href={`/careers/${params.slug}/jobs`}
            className="mt-4 inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            ← Back to all roles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        {/* Back link */}
        <Link
          href={`/careers/${params.slug}/jobs`}
          className="text-sm text-slate-600 hover:text-indigo-600"
        >
          ← Back to all roles
        </Link>

        {/* Job Header */}
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span>{companyName}</span>
            {job.department && <span>• {job.department}</span>}
            {job.location && <span>• {job.location}</span>}
          </div>
        </header>

        {/* Apply CTA */}
        <div>
          <Link
            href={`/careers/${params.slug}/jobs/${job.id}/apply`}
            className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Apply for this role
          </Link>
        </div>

        {/* Job Description */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">About the role</h2>
          <div className="prose prose-sm mt-4 text-slate-700 whitespace-pre-wrap">
            {job.description || "A description for this role has not been provided."}
          </div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

type PublicJob = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  department?: string | null;
};

async function fetchJob(orgSlug: string, jobId: string): Promise<PublicJob | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/jobs/${jobId}`, {
      headers: { "x-org-id": orgSlug },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PublicJob;
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function PublicJobDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; publicJobId: string }>;
}) {
  const { orgSlug, publicJobId } = await params;
  const job = await fetchJob(orgSlug, publicJobId);

  if (!job) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Role not found</h1>
          <p className="mt-1 text-sm text-slate-600">
            This role may be closed or temporarily unavailable.
          </p>
          <Link
            href={`/careers/${orgSlug}/jobs`}
            className="mt-3 inline-flex text-sm font-medium text-indigo-600"
          >
            ← Back to all roles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
      <Link
        href={`/careers/${orgSlug}/jobs`}
        className="text-sm text-slate-600 hover:text-indigo-600"
      >
        ← Back to all roles
      </Link>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open role</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {job.title}
          </h1>
          <p className="text-sm text-slate-600">
            {job.location || "Location flexible"}
            {job.department ? ` • ${job.department}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/careers/${orgSlug}/jobs/${job.id}/apply`}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Apply
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">About this role</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {job.description || "The hiring team will add a description soon."}
          </p>
        </div>
      </section>
    </main>
  );
}

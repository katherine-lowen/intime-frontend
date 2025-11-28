// src/app/careers/[slug]/jobs/[id]/page.tsx
import Link from "next/link";
import CareersApplyForm from "@/components/careers-apply-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export const dynamic = "force-dynamic";

type Question = {
  id: string;
  label: string;
  helpText?: string | null;
  type: string;
  required: boolean;
  optionsJson?: any;
};

type PublicJobDetail = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  department?: string | null;
  createdAt?: string | null;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
  applicationTemplate: {
    id: string;
    name: string;
    description?: string | null;
    questions: Question[];
  } | null;
};

async function fetchJob(id: string): Promise<PublicJobDetail | null> {
  try {
    // Backend: CareersController.getJob -> GET /careers/jobs/:id
    const res = await fetch(`${API_URL}/careers/jobs/${id}`, {
      headers: {
        "X-Org-Id": ORG_ID,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to load careers job", res.status, res.statusText);
      return null;
    }

    return (await res.json()) as PublicJobDetail;
  } catch (err) {
    console.error("Error fetching careers job", err);
    return null;
  }
}

function formatCompanyFromSlug(slug: string): string {
  const cleaned = slug.replace(/-careers$/i, "");
  return (
    cleaned
      .split("-")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" ") || "Your company"
  );
}

function formatPosted(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function CareersJobDetailPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const job = await fetchJob(params.id);

  if (!job) {
    const companyName = formatCompanyFromSlug(params.slug);
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          This role is no longer available
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          It may have been filled or closed at {companyName}.{" "}
          <Link
            href={`/careers/${params.slug}/jobs`}
            className="text-indigo-600 hover:underline"
          >
            View all open roles →
          </Link>
        </p>
      </main>
    );
  }

  const companyName = formatCompanyFromSlug(params.slug);
  const metaLine = [job.department, job.location].filter(Boolean).join(" • ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        {/* Back link */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/careers/${params.slug}/jobs`}
            className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
          >
            ← Back to all roles
          </Link>
          <span className="text-[11px] text-slate-500">
            {companyName} · Careers
          </span>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open role
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
              {companyName}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {job.title}
            </h1>
            {metaLine && (
              <p className="mt-1 text-sm text-slate-600">{metaLine}</p>
            )}
            {job.createdAt && (
              <p className="mt-1 text-[11px] text-slate-400">
                Posted {formatPosted(job.createdAt)}
              </p>
            )}
          </div>
        </header>

        {/* Job description */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            About this role
          </h2>
          <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
            {job.description ||
              "The hiring manager is still polishing this job description."}
          </p>
        </section>

        {/* Application form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CareersApplyForm job={job} />
        </section>
      </main>
    </div>
  );
}

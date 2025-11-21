// src/app/careers/status/[publicId]/page.tsx
import Link from "next/link";
import api from "@/lib/api";

type CandidateStatusResponse = {
  candidate: {
    id: string;
    publicId: string;
    name: string;
    email: string | null;
    stage: string;
    source?: string | null;
    appliedAt: string;
  };
  job: {
    id: string;
    title: string;
    location?: string | null;
    department?: string | null;
    description?: string | null;
  } | null;
  answers: {
    id: string;
    questionId: string;
    questionLabel: string;
    answerText: string | null;
  }[];
};

async function getCandidateStatus(publicId: string): Promise<CandidateStatusResponse> {
  return api.get(`/careers/candidates/${publicId}`);
}

function formatStage(stage: string) {
  if (!stage) return "Unknown";
  return stage
    .toLowerCase()
    .split(/[_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export const dynamic = "force-dynamic";

export default async function CandidateStatusPage({
  params,
}: {
  params: { publicId: string };
}) {
  let data: CandidateStatusResponse | null = null;
  let error: string | null = null;

  try {
    data = await getCandidateStatus(params.publicId);
  } catch (e) {
    console.error("Failed to load candidate status", e);
    error = "We couldn't find this application. The link may be invalid or expired.";
  }

  if (!data || error) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 text-sm text-red-800 shadow-sm">
          <h1 className="text-base font-semibold">Application not found</h1>
          <p className="mt-2 text-sm">
            {error ??
              "We couldn't find an application for this link. If you think this is a mistake, contact the recruiter who shared this link with you."}
          </p>
          <div className="mt-4">
            <Link
              href="/careers"
              className="inline-flex items-center text-xs font-medium text-red-800 underline underline-offset-2"
            >
              Back to open roles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { candidate, job, answers } = data;

  const appliedDate = new Date(candidate.appliedAt);
  const appliedLabel = Number.isNaN(appliedDate.getTime())
    ? "—"
    : appliedDate.toLocaleString();

  const stageLabel = formatStage(candidate.stage);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Application status
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {candidate.name}
        </h1>
        <p className="text-sm text-neutral-600">
          This page lets you check the status of your application with the hiring team.
          Save this link if you want to come back later.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          {candidate.email && (
            <span className="rounded-full bg-neutral-100 px-2 py-1">
              {candidate.email}
            </span>
          )}
          <span className="rounded-full bg-neutral-100 px-2 py-1">
            Applied {appliedLabel}
          </span>
          {candidate.source && (
            <span className="rounded-full bg-neutral-100 px-2 py-1">
              Source: {candidate.source}
            </span>
          )}
        </div>
      </header>

      {/* Layout */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
        {/* Left: status + answers */}
        <div className="space-y-4">
          {/* Status card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Current status
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {stageLabel}
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                Application received
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-600">
              The hiring team uses Intime to track applications. As they move you
              through the process, this status may update to reflect stages like
              screening, interviews, or offer.
            </p>
          </div>

          {/* Answers card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900">
              Your application details
            </h2>
            <p className="mt-1 text-xs text-neutral-600">
              A snapshot of what you submitted with your application.
            </p>

            {answers.length === 0 ? (
              <p className="mt-3 text-xs text-neutral-400">
                No additional questions were answered as part of this application.
              </p>
            ) : (
              <dl className="mt-3 space-y-3 text-sm">
                {answers.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2"
                  >
                    <dt className="text-[11px] font-medium text-neutral-600">
                      {a.questionLabel}
                    </dt>
                    <dd className="mt-1 text-xs text-neutral-900 whitespace-pre-wrap">
                      {a.answerText || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Right: job summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Role
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {job?.title ?? "Role no longer listed"}
            </p>
            {job && (
              <>
                <p className="mt-1 text-xs text-neutral-600">
                  {[job.location, job.department].filter(Boolean).join(" • ") ||
                    "Location not specified"}
                </p>
                {job.description && (
                  <p className="mt-3 text-xs text-neutral-600 line-clamp-5 whitespace-pre-wrap">
                    {job.description}
                  </p>
                )}
                <div className="mt-3">
                  <Link
                    href={`/careers/${job.id}`}
                    className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                  >
                    View full job description →
                  </Link>
                </div>
              </>
            )}
            {!job && (
              <p className="mt-2 text-xs text-neutral-500">
                This job may have been closed or removed since you applied, but your
                application is still on record with the hiring team.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 shadow-sm">
            <p className="font-semibold text-neutral-800">Need help?</p>
            <p className="mt-1">
              If you have questions about your application, reply directly to any email
              you received from the recruiter or hiring manager. This page is a
              read-only view powered by Intime.
            </p>
            <div className="mt-3">
              <Link
                href="/careers"
                className="inline-flex items-center text-xs font-medium text-neutral-700 hover:underline"
              >
                Back to open roles →
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

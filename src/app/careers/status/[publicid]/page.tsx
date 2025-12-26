// src/app/careers/status/[publicId]/page.tsx
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
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
    orgSlug?: string | null;
  } | null;
  org?: {
    name: string;
    logoUrl?: string | null;
    tagline?: string | null;
    supportEmail?: string | null;
    supportUrl?: string | null;
  } | null;
  answers: {
    id: string;
    questionId: string;
    questionLabel: string;
    answerText: string | null;
  }[];
};

async function getCandidateStatus(
  publicId: string,
): Promise<CandidateStatusResponse> {
  const data = await api.get<CandidateStatusResponse>(
    `/careers/candidates/${publicId}`,
  );

  // api.get can return undefined; guard so this function never does
  if (!data) {
    throw new Error("No candidate status returned for this link.");
  }

  return data;
}

function formatStage(stage: string) {
  if (!stage) return "Unknown";
  return stage
    .toLowerCase()
    .split(/[_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function getStageDisplay(stage: string) {
  const normalized = stage?.toUpperCase();
  switch (normalized) {
    case "APPLIED":
      return {
        label: "Application received",
        message:
          "Your application has been received and is in the queue for review.",
        tone: "neutral" as const,
      };
    case "REVIEW":
    case "SCREEN":
      return {
        label: "Under review",
        message: "The hiring team is reviewing your application.",
        tone: "neutral" as const,
      };
    case "INTERVIEW":
      return {
        label: "Interviewing",
        message:
          "You are in the interview process. The team will contact you with next steps.",
        tone: "neutral" as const,
      };
    case "OFFER":
      return {
        label: "Offer stage",
        message: "You are in the offer stage. The company will reach out with details.",
        tone: "positive" as const,
      };
    case "HIRED":
      return {
        label: "Hired",
        message: "Congratulations, you have been hired for this role.",
        tone: "positive" as const,
      };
    case "REJECTED":
    case "DECLINED":
      return {
        label: "No longer in process",
        message:
          "You are no longer being considered for this role. Thank you for your interest.",
        tone: "negative" as const,
      };
    default:
      return {
        label: "In process",
        message: "Your application is in progress with the hiring team.",
        tone: "neutral" as const,
      };
  }
}

function stageBadgeClass(tone: "neutral" | "positive" | "negative") {
  if (tone === "positive") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  if (tone === "negative") {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-700";
}

export const dynamic = "force-dynamic";

export default async function CandidateStatusPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  let data: CandidateStatusResponse | null = null;
  let error: string | null = null;

  try {
    data = await getCandidateStatus(publicId);
  } catch (e) {
    console.error("Failed to load candidate status", e);
    error =
      "We couldn't find this application. The link may be invalid or expired.";
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

  const { candidate, job, answers, org } = data;

  const appliedDate = new Date(candidate.appliedAt);
  const appliedLabel = Number.isNaN(appliedDate.getTime())
    ? "—"
    : appliedDate.toLocaleString();

  const stageLabel = formatStage(candidate.stage);
  const stageDisplay = getStageDisplay(candidate.stage);

  const supportLink = org?.supportUrl || org?.supportEmail;

  return (
    <main className="mx-auto max-w-xl px-6 py-10 space-y-6">
      {/* Header */}
      <header className="space-y-3 text-center">
        {org?.logoUrl ? (
          <div className="mx-auto h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
            <img
              src={org.logoUrl}
              alt={org.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-200" />
        )}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {org?.name || "Application status"}
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Application for {job?.title ?? "this role"}
        </h1>
        {org?.tagline && (
          <p className="text-xs text-slate-500">{org.tagline}</p>
        )}
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">
          Hi {candidate.name || "there"}, here’s your application status.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold ${stageBadgeClass(
              stageDisplay.tone
            )}`}
          >
            {stageDisplay.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{stageDisplay.message}</p>

        <div className="mt-4 space-y-1 text-xs text-slate-500">
          <div>Stage: {stageLabel}</div>
          <div>Applied: {appliedLabel}</div>
          {job?.location && <div>Location: {job.location}</div>}
          {candidate.email && <div>Email: {candidate.email}</div>}
          {candidate.source && <div>Source: {candidate.source}</div>}
        </div>

        {supportLink && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Need help?</p>
            {org?.supportUrl ? (
              <a
                href={org.supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center text-[11px] font-medium text-indigo-600 hover:underline"
              >
                Contact {org.name} →
              </a>
            ) : (
              <a
                href={`mailto:${org?.supportEmail}`}
                className="mt-1 inline-flex items-center text-[11px] font-medium text-indigo-600 hover:underline"
              >
                Email {org?.supportEmail}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <h2 className="text-sm font-semibold text-slate-900">
          Your application details
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          A snapshot of what you submitted with your application.
        </p>

        {answers.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">
            No additional questions were answered as part of this application.
          </p>
        ) : (
          <dl className="mt-3 space-y-3 text-sm">
            {answers.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <dt className="text-[11px] font-medium text-slate-600">
                  {a.questionLabel}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-xs text-slate-900">
                  {a.answerText || "—"}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500">
        Powered by{" "}
        <a
          href="https://www.hireintime.ai"
          className="font-semibold text-slate-700 hover:text-slate-900"
        >
          Intime
        </a>
      </div>
    </main>
  );
}

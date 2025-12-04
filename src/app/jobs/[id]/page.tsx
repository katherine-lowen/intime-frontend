import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import JobAtsClient from "./JobsAtsClient";

export const dynamic = "force-dynamic";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type JobFromApi = {
  id: string;
  title: string;
  status: JobStatus;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  createdAt?: string;

  publishToJobBoard?: boolean;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
  compensationNotes?: string | null;
};

type JobDataForUI = {
  id: string;
  title: string;
  status: string;
  department: string;
  location: string;
  createdDate: string;
  roleOverview: string;
  compensationBand: string;
  description: string;
  boardStatus: string;
};

async function getJob(jobId: string): Promise<JobFromApi> {
  return api.get<JobFromApi>(`/jobs/${jobId}`);
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

function formatComp(job: JobFromApi): string {
  const { compensationMin, compensationMax, compensationCurrency } = job;

  if (compensationMin == null && compensationMax == null) {
    return "Not set";
  }

  const currency = compensationCurrency || "USD";

  if (compensationMin != null && compensationMax != null) {
    return `${currency} ${compensationMin.toLocaleString()}–${compensationMax.toLocaleString()} (annual)`;
  }

  if (compensationMin != null) {
    return `${currency} ${compensationMin.toLocaleString()}+ (annual)`;
  }

  return `${currency} up to ${compensationMax!.toLocaleString()} (annual)`;
}

function mapJobToUI(job: JobFromApi): JobDataForUI {
  return {
    id: job.id,
    title: job.title,
    status: job.status === "OPEN" ? "Active" : job.status,
    department: job.department ?? "Not specified",
    location: job.location ?? "Not specified",
    createdDate: job.createdAt ? formatDate(job.createdAt) : "—",
    roleOverview:
      job.description?.split("\n\n")[0] ??
      "Add a short overview for this role in the job description.",
    compensationBand: formatComp(job),
    description: job.description ?? "",
    boardStatus: job.publishToJobBoard
      ? "Published on your careers page"
      : "Not yet published",
  };
}

/**
 * Server component wrapper for the ATS view.
 * Note: in your Next version `params` is a Promise, so we `await` it.
 */
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;

  if (!jobId) {
    throw new Error("Missing job id in route params");
  }

  const job = await getJob(jobId);
  const jobDataForUI = mapJobToUI(job);

  return (
    <AuthGate>
      <JobAtsClient jobId={jobId} jobData={jobDataForUI} />
    </AuthGate>
  );
}

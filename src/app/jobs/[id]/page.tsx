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

async function getJob(jobId: string): Promise<JobFromApi | null> {
  try {
    const job = await api.get<JobFromApi>(`/jobs/${jobId}`);
    return job;
  } catch (err) {
    console.error("Failed to load job from API", { jobId, err });
    return null;
  }
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

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const jobId = params.id;

  const job = await getJob(jobId);

  if (!job) {
    return (
      <AuthGate>
        <main className="p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Job not available
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-md">
            We couldn&apos;t load this job from the API in the production
            environment. It may have been removed, or there could be a
            configuration issue with the backend URL or organization ID.
          </p>
        </main>
      </AuthGate>
    );
  }

  const jobDataForUI = mapJobToUI(job);

  return (
    <AuthGate>
      <JobAtsClient jobId={jobId} jobData={jobDataForUI} />
    </AuthGate>
  );
}

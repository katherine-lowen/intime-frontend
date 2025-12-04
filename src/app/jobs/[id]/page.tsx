// src/app/jobs/[id]/page.tsx
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

// Pull API + ORG directly from env
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ORG_ID =
  process.env.NEXT_PUBLIC_ORG_ID ||
  process.env.DEFAULT_ORG_ID ||
  "demo-org";

async function fetchJob(jobId: string): Promise<JobFromApi | null> {
  const url = `${API_URL}/jobs/${encodeURIComponent(jobId)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Org-Id": ORG_ID,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");

      console.error("FAILED JOB FETCH", {
        url,
        jobId,
        status: res.status,
        statusText: res.statusText,
        API_URL,
        ORG_ID,
        body: body.slice(0, 400),
      });

      return null;
    }

    return (await res.json()) as JobFromApi;
  } catch (err) {
    console.error("JOB FETCH ERROR", { url, jobId, API_URL, ORG_ID, err });
    return null;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const dt = new Date(dateStr);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = params.id;
  const job = await fetchJob(jobId);

  if (!job) {
    return (
      <AuthGate>
        <main className="p-6 space-y-4">
          <h1 className="text-lg font-semibold">Job not available</h1>
          <p className="text-sm text-slate-500">
            This job could not be loaded. Check the debug info below.
          </p>

          {/* 🔥 ALWAYS SHOW DEBUG INFO */}
          <div className="rounded-lg bg-black text-lime-300 text-xs p-3 font-mono">
            <div className="font-bold text-pink-400 mb-1">DEBUG INFO</div>
            <div>jobId: {jobId}</div>
            <div>API_URL: {API_URL}</div>
            <div>ORG_ID: {ORG_ID}</div>
            <div>fetch URL: {`${API_URL}/jobs/${jobId}`}</div>
          </div>

          <p className="text-[11px] text-slate-500">
            Now check Vercel logs for “FAILED JOB FETCH” or “JOB FETCH ERROR”.
          </p>
        </main>
      </AuthGate>
    );
  }

  const uiData: JobDataForUI = {
    id: job.id,
    title: job.title,
    status: job.status,
    department: job.department ?? "Not specified",
    location: job.location ?? "Not specified",
    createdDate: job.createdAt ? formatDate(job.createdAt) : "—",
    roleOverview: job.description?.split("\n\n")[0] ?? "",
    compensationBand: "Not implemented",
    description: job.description ?? "",
    boardStatus: "Unknown",
  };

  return (
    <AuthGate>
      <JobAtsClient jobId={jobId} jobData={uiData} />
    </AuthGate>
  );
}

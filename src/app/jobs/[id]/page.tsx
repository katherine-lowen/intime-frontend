// src/app/jobs/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import JobAtsClient from "./JobsAtsClient";
import { PipelineTab } from "./components/PipelineTab";


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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
const ORG_ID =
  process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

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

export default function JobDetailPage() {
  const params = useParams<{ id?: string | string[] }>();

  const rawParamId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;

  const jobId =
    rawParamId && rawParamId !== "undefined" ? rawParamId : undefined;

  const [job, setJob] = useState<JobFromApi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError("Missing jobId from route");
      return;
    }

    const safeJobId = jobId as string;
    let cancelled = false;

    async function fetchJob() {
      try {
        const url = `${API_URL}/jobs/${encodeURIComponent(safeJobId)}`;
        const res = await fetch(url, {
          headers: {
            "x-org-id": ORG_ID,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Job fetch failed", res.status, text);
          if (!cancelled) {
            setError(`Failed to load job (${res.status})`);
            setLoading(false);
          }
          return;
        }

        const data: JobFromApi = await res.json();
        if (!cancelled) {
          setJob(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Job fetch error", err);
        if (!cancelled) {
          setError("Unexpected error fetching job");
          setLoading(false);
        }
      }
    }

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Loading state
  if (loading) {
    return (
      <AuthGate>
        <main className="p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Loading job…
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Fetching job details from the API.
          </p>
        </main>
      </AuthGate>
    );
  }

  // Missing jobId or error state
  if (!jobId || error || !job) {
    return (
      <AuthGate>
        <main className="p-6 space-y-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Job not available
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-md">
            This job could not be loaded. Either the link is missing an ID, or
            there was an issue fetching the job from the API.
          </p>

          <div className="mt-3 rounded-md bg-slate-900 text-slate-100 p-3 text-xs space-y-1">
            <div>rawParamId: {String(rawParamId)}</div>
            <div>jobId (normalized): {jobId || "(none)"}</div>
            <div>API_URL: {API_URL}</div>
            <div>ORG_ID: {ORG_ID}</div>
            {jobId ? (
              <div>
                fetch URL: {`${API_URL}/jobs/${encodeURIComponent(
                  jobId as string,
                )}`}
              </div>
            ) : (
              <div>fetch URL: (skipped because jobId is missing)</div>
            )}
            {error && <div className="text-red-300">error: {error}</div>}
            <div className="mt-2 text-[10px] text-slate-400">
              Path (client):{" "}
              {typeof window !== "undefined"
                ? window.location.pathname
                : "(server render)"}
            </div>
          </div>
        </main>
      </AuthGate>
    );
  }

  const jobDataForUI = mapJobToUI(job);
  const ensuredJobId = jobId as string;

  return (
    <AuthGate>
      <JobAtsClient jobId={ensuredJobId} jobData={jobDataForUI} />
    </AuthGate>
  );
}

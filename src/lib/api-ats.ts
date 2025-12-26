// src/lib/api-ats.ts
import type {
  Job,
  Candidate,
  AiCandidateSummary,
  AiJobShortlist,
  Application,
} from "./ats-types";
import { API_BASE_URL } from "@/lib/api";

const parseJson = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const buildHeaders = (orgIdOrSlug: string) => ({
  "Content-Type": "application/json",
  "x-org-id": orgIdOrSlug,
});

export async function listJobs(orgIdOrSlug: string): Promise<Job[]> {
  const res = await fetch(`${API_BASE_URL}/ats/jobs`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message = (json as any)?.message || `Failed to list jobs (status ${res.status})`;
    throw new Error(message);
  }
  return (json as Job[]) ?? [];
}

export async function createJob(
  orgIdOrSlug: string,
  payload: { title: string; department?: string; location?: string }
): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/ats/jobs`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message = (json as any)?.message || `Failed to create job (status ${res.status})`;
    throw new Error(message);
  }
  return json as Job;
}

export async function getJob(orgIdOrSlug: string, jobId: string): Promise<Job | null> {
  const res = await fetch(`${API_BASE_URL}/ats/jobs/${jobId}`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message = (json as any)?.message || `Failed to fetch job (status ${res.status})`;
    throw new Error(message);
  }
  return (json as Job) ?? null;
}

export async function listJobCandidates(
  orgIdOrSlug: string,
  jobId: string
): Promise<Candidate[]> {
  const res = await fetch(`${API_BASE_URL}/ats/jobs/${jobId}/candidates`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message =
      (json as any)?.message || `Failed to list candidates (status ${res.status})`;
    throw new Error(message);
  }
  return (json as Candidate[]) ?? [];
}

export async function createCandidate(
  orgIdOrSlug: string,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    linkedInUrl?: string;
    jobId?: string;
  }
): Promise<Candidate> {
  const res = await fetch(`${API_BASE_URL}/ats/candidates`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message =
      (json as any)?.message || `Failed to create candidate (status ${res.status})`;
    throw new Error(message);
  }
  return json as Candidate;
}

export async function createApplication(
  orgIdOrSlug: string,
  jobId: string,
  payload: { candidateId: string }
): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/ats/jobs/${jobId}/applications`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message =
      (json as any)?.message || `Failed to create application (status ${res.status})`;
    throw new Error(message);
  }
  return json as Application;
}

export async function updateApplication(
  orgIdOrSlug: string,
  applicationId: string,
  payload: { stage?: string; notes?: string | null }
): Promise<Application> {
  const res = await fetch(`${API_BASE_URL}/ats/applications/${applicationId}`, {
    method: "PATCH",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message =
      (json as any)?.message || `Failed to update application (status ${res.status})`;
    throw new Error(message);
  }
  return json as Application;
}

export async function seedAtsDemo(
  orgIdOrSlug: string,
  payload: { jobTitle?: string; jobId?: string; candidateCount?: number }
): Promise<{ job?: Job; candidates?: Candidate[]; jobId?: string }> {
  const res = await fetch(`${API_BASE_URL}/ats/demo/seed`, {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message = (json as any)?.message || `Failed to seed demo data (status ${res.status})`;
    throw new Error(message);
  }
  return (json as { job?: Job; candidates?: Candidate[]; jobId?: string }) ?? {};
}

export async function getCandidate(
  orgIdOrSlug: string,
  candidateId: string
): Promise<Candidate | null> {
  const res = await fetch(`${API_BASE_URL}/ats/candidates/${candidateId}`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    const message =
      (json as any)?.message || `Failed to fetch candidate (status ${res.status})`;
    throw new Error(message);
  }
  return (json as Candidate) ?? null;
}

export type InternalMatch = {
  id: string;
  name?: string | null;
  role?: string | null;
  fitScore?: number | null;
  why?: string | null;
  gaps?: string | null;
  userId?: string | null;
  courseId?: string | null;
  courseName?: string | null;
  actionUrl?: string | null;
  recommendationKey?: string | null;
};

export async function listInternalMatches(orgIdOrSlug: string, jobId: string): Promise<InternalMatch[]> {
  const res = await fetch(`${API_BASE_URL}/ats/jobs/${jobId}/internal-matches`, {
    method: "GET",
    credentials: "include",
    headers: buildHeaders(orgIdOrSlug),
  });
  const json = await parseJson(res);
  if (!res.ok) {
    if (res.status === 404) return [];
    const message =
      (json as any)?.message || `Failed to fetch internal matches (status ${res.status})`;
    throw new Error(message);
  }
  const raw = Array.isArray(json) ? json : Array.isArray((json as any)?.matches) ? (json as any).matches : [];
  return (raw as any[]).map((m, idx) => ({
    id: m?.id ?? m?.userId ?? `match-${idx}`,
    name: m?.name ?? m?.employeeName ?? null,
    role: m?.role ?? m?.title ?? null,
    fitScore: m?.fitScore ?? m?.score ?? null,
    why: m?.why ?? m?.reasons ?? m?.summary ?? null,
    gaps: m?.gaps ?? null,
    userId: m?.userId ?? null,
    courseId: m?.courseId ?? null,
    courseName: m?.courseName ?? null,
    actionUrl: m?.href ?? m?.link ?? null,
    recommendationKey: m?.recommendationKey ?? null,
  }));
}

export async function generateCandidateSummary(
  orgIdOrSlug: string,
  payload: { candidateId: string; jobId?: string | null; force?: boolean }
): Promise<AiCandidateSummary> {
  const res = await fetch(`${API_BASE_URL}/ats/ai/candidate-summary`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgIdOrSlug,
    },
    body: JSON.stringify({
      candidateId: payload.candidateId,
      jobId: payload.jobId ?? null,
      force: payload.force ?? false,
    }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `AI summary failed with status ${res.status}`;
    throw new Error(message);
  }

  return (json as AiCandidateSummary) ?? ({} as AiCandidateSummary);
}

export async function generateJobShortlist(
  orgIdOrSlug: string,
  payload: { jobId: string; force?: boolean }
): Promise<AiJobShortlist> {
  const res = await fetch(`${API_BASE_URL}/ats/ai/shortlist`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgIdOrSlug,
    },
    body: JSON.stringify({
      jobId: payload.jobId,
      force: payload.force ?? false,
    }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `AI shortlist failed with status ${res.status}`;
    throw new Error(message);
  }

  return (json as AiJobShortlist) ?? ({} as AiJobShortlist);
}

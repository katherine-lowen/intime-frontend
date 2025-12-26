// src/lib/api-pipeline.ts
export type PipelineStage = {
  id: string;
  name: string;
  order: number;
};

export type PipelineCandidate = {
  applicationId: string;
  candidateId: string;
  stageId: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  candidateStage: string | null;
  matchScore: number | null;
  createdAt: string | null;
};

export type PipelineResponse = {
  job: {
    id: string;
    title: string | null;
    status: string | null;
    location: string | null;
    department: string | null;
    description: string | null;
  } | null;
  stages: PipelineStage[];
  candidates: PipelineCandidate[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

/**
 * Demo-mode pipeline fetch:
 * GET /org/:orgSlug/jobs/:jobId/pipeline
 */
export async function fetchPipelineForOrgJob(
  orgSlug: string,
  jobId: string
): Promise<PipelineResponse> {
  const url = `${API_BASE}/org/${encodeURIComponent(
    orgSlug
  )}/jobs/${encodeURIComponent(jobId)}/pipeline`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("fetchPipelineForOrgJob failed", res.status, await safeText(res));
    return { job: null, stages: [], candidates: [] };
  }

  return (await res.json()) as PipelineResponse;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

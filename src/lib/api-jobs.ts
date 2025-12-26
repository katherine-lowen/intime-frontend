// src/lib/api-jobs.ts

export type JobSummary = {
  id: string;
  title: string | null;
  department: string | null;
  location: string | null;
  status: string | null;
  createdAt: string | null; // ISO string
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

/**
 * Demo/stub-mode fetch used by /org/[orgSlug]/jobs
 * Backend endpoint: GET /org/:orgSlug/jobs  -> { data: JobSummary[] }
 */
export async function fetchJobsForOrg(orgSlug: string): Promise<JobSummary[]> {
  const url = `${API_BASE}/org/${encodeURIComponent(orgSlug)}/jobs`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("fetchJobsForOrg failed", res.status, await safeText(res));
    return [];
  }

  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];

  return data.map(normalizeJobSummary);
}

/**
 * Optional: authed internal endpoint (matches your existing JobsController listOrgJobs)
 * Backend endpoint: GET /jobs/org?status=OPEN&search=...
 * Returns: Job objects (not wrapped in {data})
 *
 * Only use this when you have a JWT and are ready to send Authorization headers.
 */
export async function fetchOrgJobsAuthed(params: {
  token: string;
  status?: string;
  search?: string;
}): Promise<JobSummary[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);

  const url = `${API_BASE}/jobs/org${qs.toString() ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  });

  if (!res.ok) {
    console.error(
      "fetchOrgJobsAuthed failed",
      res.status,
      await safeText(res)
    );
    return [];
  }

  const json = await res.json();
  const data = Array.isArray(json) ? json : [];

  return data.map(normalizeJobSummaryFromInternal);
}

/** ---------- helpers ---------- */

function normalizeJobSummary(raw: any): JobSummary {
  return {
    id: String(raw?.id ?? ""),
    title: raw?.title ?? null,
    department: raw?.department ?? null,
    location: raw?.location ?? null,
    status: raw?.status ?? null,
    createdAt: typeof raw?.createdAt === "string" ? raw.createdAt : null,
  };
}

// Your internal /jobs/org returns `slug` and `createdAt` as ISO already.
// We just normalize the same shape.
function normalizeJobSummaryFromInternal(raw: any): JobSummary {
  return {
    id: String(raw?.id ?? ""),
    title: raw?.title ?? null,
    department: raw?.department ?? null,
    location: raw?.location ?? null,
    status: raw?.status ?? null,
    createdAt: typeof raw?.createdAt === "string" ? raw.createdAt : null,
  };
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

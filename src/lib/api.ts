// --- Config ---
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type Json = Record<string, any> | any[];

// --- Fixtures for MOCK mode ---
const fixtures: Record<string, any> = {
  "/stats": { employees: 42, openRoles: 7, approvals: 5 },
  "/events": [
    { id: "evt_101", source: "HR", type: "hire", summary: "Hired Alex Chen", createdAt: "2h ago" },
    { id: "evt_102", source: "ATS", type: "offer", summary: "Offer sent to Dana Kim", createdAt: "5h ago" },
    { id: "evt_103", source: "HR", type: "update", summary: "Policy updated: PTO", createdAt: "1d ago" },
  ],
  "/jobs": [
    { id: "job_1", title: "Senior Frontend Engineer", status: "Open", applicants: 32 },
    { id: "job_2", title: "People Ops Generalist", status: "Open", applicants: 14 },
  ],
  "/employees": [
    { id: "emp_1", name: "Alex Chen", role: "Engineer", status: "Active" },
    { id: "emp_2", name: "Dana Kim", role: "People Ops", status: "Active" },
  ],
  "/users": [
    { id: "u_1", name: "Alex Chen", email: "alex@example.com" },
    { id: "u_2", name: "Dana Kim", email: "dana@example.com" },
  ],
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// --- Core request ---
async function request<T = any>(endpoint: string, init: RequestInit = {}): Promise<T> {
  if (MOCK) {
    await sleep(200);
    if (init.method && init.method !== "GET") return { ok: true } as any;
    if (!(endpoint in fixtures)) throw new Error(`Mock fixture missing for ${endpoint}`);
    return structuredClone(fixtures[endpoint]) as T;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Org-Id": ORG_ID,
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return {} as T;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Simple verbs ---
export const get  = <T=any>(endpoint: string) => request<T>(endpoint, { method: "GET" });
export const post = <T=any>(endpoint: string, body?: Json) =>
  request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined });
export const put  = <T=any>(endpoint: string, body?: Json) =>
  request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
export const del  = <T=any>(endpoint: string) => request<T>(endpoint, { method: "DELETE" });

// --- Namespaces your pages expect ---
export const api = { get, post, put, del };

export const analytics = {
  stats: () => get("/stats"),
  events: () => get("/events"),
};

export const users = {
  list: () => get("/users"),
  get: (id: string) => get(`/users/${id}`),
};

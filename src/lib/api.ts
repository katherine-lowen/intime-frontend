// src/lib/api.ts
// Single source of truth for the external API host.
// We accept either NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL to avoid
// misconfiguration between server and client components.
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

// Normalize: strip trailing slash and an accidental "/api" path segment so we don't
// end up calling nonexistent routes like /api/employees.
export const API_BASE_URL = rawBase
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");

// Optional: use this ONLY if you want to force a specific org for debugging.
// Leave it undefined in real multi-org mode.
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "";

/**
 * Try to read identity info from the browser.
 * Populated by IdentitySync.tsx after Supabase login.
 */
function getIdentityHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const email = window.localStorage.getItem("intime_user_email") || "";
  const name = window.localStorage.getItem("intime_user_name") || "";

  const headers: Record<string, string> = {};
  if (email) headers["x-user-email"] = email;
  if (name) headers["x-user-name"] = name;

  // If you *really* want to hard-force an org on the frontend side
  // (e.g., demo or single-tenant mode), set NEXT_PUBLIC_ORG_ID in env.
  if (ORG_ID) {
    headers["x-org-id"] = ORG_ID;
  }

  return headers;
}

/**
 * Low-level fetch wrapper.
 *
 * NOTE: 404 is treated as "no data" and returns `undefined` instead of throwing,
 * so callers like `/auth/me` don't blow up the whole app.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit & { jsonBody?: unknown } = {}
): Promise<T | undefined> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const { jsonBody, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...getIdentityHeaders(),
    ...(headers || {}),
  };

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      jsonBody !== undefined
        ? JSON.stringify(jsonBody)
        : (rest.body as BodyInit | null | undefined),
    cache: "no-store",
  });

  // 👉 Special case: 404 = "no data" instead of hard error
  if (res.status === 404) {
    const text = await res.text().catch(() => "");
    console.warn(
      "[api.ts] 404",
      options.method || "GET",
      url,
      "→",
      res.status,
      text
    );
    return undefined as T;
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(
      "[api.ts] Error",
      options.method || "GET",
      url,
      "→",
      res.status,
      text
    );
    throw new Error(
      `API ${options.method || "GET"} ${path} failed: ${res.status}`
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

const api = {
  get:  <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", jsonBody: body }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", jsonBody: body }),
  del:  <T>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};

export default api;

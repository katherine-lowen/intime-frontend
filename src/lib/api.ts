// src/lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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

async function apiFetch<T>(
  path: string,
  options: RequestInit & { jsonBody?: unknown } = {}
): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

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
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", jsonBody: body }),

  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", jsonBody: body }),

  del: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

export default api;

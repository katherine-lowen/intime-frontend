// src/lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

async function apiFetch<T>(
  path: string,
  options: RequestInit & { jsonBody?: unknown } = {}
): Promise<T> {
  const base = API_BASE_URL.replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const { jsonBody, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "x-org-id": ORG_ID,
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
    console.error("[api.ts] Error", options.method || "GET", url, "→", res.status, text);
    throw new Error(`API ${options.method || "GET"} ${path} failed: ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

const api = {
  get: <T>(path: string) =>
    apiFetch<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", jsonBody: body }),

  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", jsonBody: body }),

  del: <T>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};

export default api;

// src/lib/api.ts

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";

export const API_URL = RAW_API_URL.replace(/\/+$/, "");

export const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export async function apiFetch<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: any
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Org-Id": ORG_ID,
      "X-Api-Key": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[api.ts] Error", method, url, "→", res.status, text);
    throw new Error(`API ${method} ${path} failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, "GET"),
  post: <T = any>(path: string, body?: any) => apiFetch<T>(path, "POST", body),
  patch: <T = any>(path: string, body?: any) => apiFetch<T>(path, "PATCH", body),
  del: <T = any>(path: string) => apiFetch<T>(path, "DELETE"),
};

export default api;

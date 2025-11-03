// src/lib/api.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type Json = Record<string, any> | any[];

async function _request<T = any>(
  endpoint: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...init,
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
  // Empty/no-content responses
  return {} as T;
}

export function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return _request<T>(endpoint, options);
}

export function get<T = any>(endpoint: string): Promise<T> {
  return _request<T>(endpoint, { method: "GET" });
}

export function post<T = any>(endpoint: string, body?: Json): Promise<T> {
  return _request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

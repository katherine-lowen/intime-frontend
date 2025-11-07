// src/lib/api.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type Json = Record<string, any> | any[];

async function _request<T = any>(
  endpoint: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Org-Id": ORG_ID,
      ...(init.headers || {}),
    },
    // prevent hanging fetches in the browser
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  return {} as T;
}

export function get<T = any>(endpoint: string, init?: RequestInit) {
  return _request<T>(endpoint, { method: "GET", ...(init || {}) });
}

export function post<T = any>(endpoint: string, body?: Json, init?: RequestInit) {
  return _request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    ...(init || {}),
  });
}

export function put<T = any>(endpoint: string, body?: Json, init?: RequestInit) {
  return _request<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    ...(init || {}),
  });
}

export function del<T = any>(endpoint: string, init?: RequestInit) {
  return _request<T>(endpoint, { method: "DELETE", ...(init || {}) });
}

export default { API_URL, get, post, put, del };

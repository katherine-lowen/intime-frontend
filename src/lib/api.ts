// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

console.log("[api.ts] Using API_URL:", API_URL);
console.log("[api.ts] Using ORG_ID:", ORG_ID ? ORG_ID : "(none)");
console.log("[api.ts] Has API_KEY:", API_KEY ? "yes" : "no");

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const url = `${API_URL}${path}`;
  try {
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
      const text = await res.text().catch(() => "");
      console.error(
        `[api.ts] API error`,
        method,
        url,
        "status:",
        res.status,
        "body:",
        text
      );
      throw new Error(`API ${method} ${path} failed: ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`[api.ts] Fetch failed`, method, url, err);
    throw err;
  }
}

const api = {
  get<T = any>(path: string) {
    return request<T>("GET", path);
  },
  post<T = any>(path: string, body?: unknown) {
    return request<T>("POST", path, body);
  },
  patch<T = any>(path: string, body?: unknown) {
    return request<T>("PATCH", path, body);
  },
  del<T = any>(path: string) {
    return request<T>("DELETE", path);
  },
};

export default api;

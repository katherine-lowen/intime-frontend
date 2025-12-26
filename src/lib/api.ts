// src/lib/api.ts

// Prefer NEXT_PUBLIC_API_URL (what we'll set on Vercel), but keep backward-compat
const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

if (
  process.env.NODE_ENV === "production" &&
  RAW_BASE.includes("localhost")
) {
  console.warn(
    "[api] NEXT_PUBLIC_API_URL points to localhost in production. Update to https://api.hireintime.ai"
  );
}

function normalizeBaseUrl(base: string) {
  // trim trailing slash
  return base.replace(/\/+$/, "");
}

function joinUrl(base: string, path: string) {
  const b = normalizeBaseUrl(base);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export const API_BASE_URL = normalizeBaseUrl(RAW_BASE);

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiErrorShape = {
  status?: number;
  code?: string;
  message?: string;
  data?: any;
  requestId?: string | undefined;
  plan?: string;
  retryAfter?: string | null;
  response?: { status: number; data: any; requestId?: string | undefined };
  [key: string]: any;
};

class ApiClient {
  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = joinUrl(API_BASE_URL, path);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
      // Keep this ON: supports cookie auth, and doesn't break header-based auth.
      credentials: "include",
      cache: "no-store",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    let res: Response;
    try {
      res = await fetch(url, options);
    } catch (err: any) {
      const apiError: ApiErrorShape = new Error(
        err?.message || "Network error"
      );
      apiError.code = "NETWORK_ERROR";
      apiError.cause = err;
      throw apiError;
    }

    const requestId =
      res.headers.get("x-request-id") || res.headers.get("x-requestid");

    const rawText = await res.text();
    let data: any = null;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }

    if (!res.ok) {
      const apiError: ApiErrorShape = new Error(
        typeof data === "object" && data?.message
          ? data.message
          : `Request failed with status ${res.status}`
      );

      apiError.status = res.status;
      apiError.data = data;
      apiError.requestId =
        requestId ||
        (typeof data === "object" && data?._requestId ? data._requestId : undefined);

      // Normalize common codes
      if (res.status === 401) apiError.code = "UNAUTHORIZED";
      if (res.status === 403) apiError.code = "FORBIDDEN";
      if (res.status === 404) apiError.code = "NOT_FOUND";

      if (res.status === 402) {
        apiError.code = "PLAN_REQUIRED";
        apiError.plan =
          (data as any)?.plan ||
          (typeof (data as any)?.message === "string" &&
          (data as any).message.toUpperCase().includes("SCALE")
            ? "SCALE"
            : "GROWTH");
      } else if (res.status === 429) {
        apiError.code = "RATE_LIMITED";
        apiError.retryAfter = res.headers.get("retry-after");
      }

      apiError.response = {
        status: res.status,
        data,
        requestId: apiError.requestId,
      };

      throw apiError;
    }

    // Attach request id to object payloads for debugging
    if (data && typeof data === "object") {
      (data as any)._requestId = requestId;
    }

    return data as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}

const api = new ApiClient();
export default api;

import { API_BASE_URL } from "@/lib/api";

const parse = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

async function withOrg<T>(orgSlug: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: init?.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgSlug,
      ...(init?.headers || {}),
    },
    body: init?.body,
  });
  const data = await parse(res);
  if (!res.ok) {
    const message =
      (data as any)?.message ||
      (data as any)?.error ||
      `Request failed (status ${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function getBillingStatus(orgSlug: string) {
  return withOrg<any>(orgSlug, "/billing/summary");
}

export async function createCheckout(orgSlug: string, priceId: string) {
  return withOrg<{ url: string }>(orgSlug, "/billing/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({ priceId }),
  });
}

export async function openBillingPortal(orgSlug: string) {
  return withOrg<{ url: string }>(orgSlug, "/billing/stripe/portal", {
    method: "POST",
  });
}

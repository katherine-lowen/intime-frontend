import api from "./api";

export type Decision = {
  id: string;
  title: string;
  status: "OPEN" | "ACCEPTED" | "REJECTED" | "DEFERRED" | string;
  category?: string | null;
  recommendationKey?: string | null;
  rationale?: string | null;
  sourceType?: string | null;
  createdAt?: string | null;
};

export type DecisionOutcome = {
  id?: string;
  note: string;
  createdAt?: string;
  author?: string;
};

export async function listDecisions(orgSlug: string, params?: { status?: string; category?: string; q?: string; cursor?: string }) {
  const search = new URLSearchParams({ orgSlug });
  if (params?.status) search.set("status", params.status);
  if (params?.category) search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  if (params?.cursor) search.set("cursor", params.cursor);
  return api.get<{ data?: Decision[]; cursor?: string } | Decision[]>(`/intelligence/decisions?${search.toString()}`);
}

export async function getDecision(orgSlug: string, id: string) {
  return api.get<Decision & { outcomes?: DecisionOutcome[] }>(`/intelligence/decisions/${id}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function createDecision(
  orgSlug: string,
  payload: {
    title: string;
    category?: string;
    rationale?: string;
    sourceType?: string;
    sourceId?: string;
    related?: string;
    recommendationKey?: string;
  }
) {
  return api.post<Decision>("/intelligence/decisions", { orgSlug, ...payload });
}

export async function ackDecision(orgSlug: string, id: string, action: "ACCEPT" | "REJECT" | "DEFER") {
  return api.post(`/intelligence/decisions/${id}/ack`, { orgSlug, action });
}

export async function addDecisionOutcome(
  orgSlug: string,
  id: string,
  payload: { note: string; recommendationKey?: string }
) {
  return api.post(`/intelligence/decisions/${id}/outcomes`, { orgSlug, ...payload });
}

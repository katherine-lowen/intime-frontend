import api from "./api";

export type Delegation = {
  id: string;
  title: string;
  enabled?: boolean;
  cadence?: string | null;
  scope?: string | null;
  policy?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: string | null;
};

export async function listDelegations(orgSlug: string) {
  return api.get<Delegation[] | { data?: Delegation[] }>(
    `/ai/delegations?orgSlug=${encodeURIComponent(orgSlug)}`
  );
}

export async function createDelegation(orgSlug: string, payload: Partial<Delegation>) {
  return api.post<Delegation>("/ai/delegations", { orgSlug, ...payload });
}

export async function updateDelegation(orgSlug: string, id: string, payload: Partial<Delegation>) {
  return api.patch<Delegation>(`/ai/delegations/${id}`, { orgSlug, ...payload });
}

export async function toggleDelegation(orgSlug: string, id: string, enabled: boolean) {
  return api.post<Delegation>(`/ai/delegations/${id}/toggle`, { orgSlug, enabled });
}

export async function runDelegation(orgSlug: string, id: string) {
  return api.post<any>(`/ai/delegations/${id}/run`, { orgSlug });
}

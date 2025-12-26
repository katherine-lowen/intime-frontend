import api from "@/lib/api";

type ListParams = Record<string, any>;

function normalizeArray<T>(res: any, key?: string): T[] {
  if (Array.isArray(res)) return res;
  if (key && Array.isArray(res?.[key])) return res[key];
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export async function listActions(orgSlug: string) {
  const res = await api.get<any>(`/orgs/${orgSlug}/ai/actions`);
  return normalizeArray(res, "actions");
}

export async function getPolicy(orgSlug: string) {
  const res = await api.get<any>(`/orgs/${orgSlug}/ai/policy`);
  return res ?? {};
}

export async function updatePolicy(orgSlug: string, patch: any) {
  const res = await api.patch<any>(`/orgs/${orgSlug}/ai/policy`, patch);
  return res ?? {};
}

export async function listInvocations(orgSlug: string, filters?: ListParams) {
  const search = filters ? `?${new URLSearchParams(filters as any).toString()}` : "";
  const res = await api.get<any>(`/orgs/${orgSlug}/ai/invocations${search}`);
  return normalizeArray(res, "invocations");
}

export async function getInvocation(orgSlug: string, id: string) {
  const res = await api.get<any>(`/orgs/${orgSlug}/ai/invocations/${id}`);
  return res ?? null;
}

export async function runAction(
  orgSlug: string,
  payload: { actionKey: string; input?: any; resource?: any }
) {
  const res = await api.post<any>(`/orgs/${orgSlug}/ai/actions/run`, payload);
  return res ?? null;
}

export async function listMemory(orgSlug: string, type?: string) {
  const search = type ? `?type=${encodeURIComponent(type)}` : "";
  const res = await api.get<any>(`/orgs/${orgSlug}/ai/memory${search}`);
  return normalizeArray(res, "items");
}

export async function createMemory(orgSlug: string, payload: any) {
  return api.post<any>(`/orgs/${orgSlug}/ai/memory`, payload);
}

export async function deleteMemory(orgSlug: string, id: string) {
  return api.delete<any>(`/orgs/${orgSlug}/ai/memory/${id}`);
}

export async function getInvocationEvidence(orgSlug: string, id: string) {
  const res = await api.get<any>(`/orgs/${orgSlug}/ai/invocations/${id}/evidence`);
  return res?.evidence || [];
}

import api from "./api";

export async function listRecommendations(orgSlug: string, weekStart?: string) {
  const search = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : "";
  const res = await api.get<any>(`/orgs/${orgSlug}/intelligence/recommendations${search}`);
  return Array.isArray(res) ? res : res?.recommendations || [];
}

export async function runRecommendations(orgSlug: string) {
  return api.post<any>(`/orgs/${orgSlug}/intelligence/recommendations/run`, {});
}

export async function simulateHeadcount(orgSlug: string, payload: any) {
  return api.post<any>(`/orgs/${orgSlug}/intelligence/simulate/headcount`, payload);
}

export async function simulateComp(orgSlug: string, payload: any) {
  return api.post<any>(`/orgs/${orgSlug}/intelligence/simulate/comp`, payload);
}

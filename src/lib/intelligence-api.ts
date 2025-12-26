import api from "@/lib/api";

function normalizeArray<T>(res: any, key?: string): T[] {
  if (Array.isArray(res)) return res;
  if (key && Array.isArray(res?.[key])) return res[key];
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export async function getOverview(orgSlug: string) {
  const res = await api.get<any>(`/orgs/${orgSlug}/intelligence/overview`);
  return res ?? {};
}

export async function listAlerts(orgSlug: string, filters?: Record<string, any>) {
  const search =
    filters && Object.keys(filters).length
      ? `?${new URLSearchParams(filters as any).toString()}`
      : "";
  const res = await api.get<any>(`/orgs/${orgSlug}/intelligence/alerts${search}`);
  return normalizeArray(res, "alerts");
}

export async function runAlerts(orgSlug: string) {
  const res = await api.post<any>(`/orgs/${orgSlug}/intelligence/alerts/run`, {});
  return res ?? null;
}

export async function resolveAlert(orgSlug: string, id: string) {
  const res = await api.post<any>(`/orgs/${orgSlug}/intelligence/alerts/${id}/resolve`, {});
  return res ?? null;
}

export async function listSnapshots(orgSlug: string) {
  const res = await api.get<any>(`/orgs/${orgSlug}/intelligence/snapshots`);
  return normalizeArray(res, "snapshots");
}

export async function runSnapshot(orgSlug: string) {
  const res = await api.post<any>(`/orgs/${orgSlug}/intelligence/snapshots/run`, {});
  return res ?? null;
}

export async function getDecisionNarrative(orgSlug: string, range: string) {
  try {
    const res = await api.get<any>(
      `/orgs/${orgSlug}/intelligence/narrative?range=${encodeURIComponent(range)}`
    );
    const data = res?.data ?? res ?? {};
    return {
      themes: Array.isArray(data.themes) ? data.themes : [],
      moments: Array.isArray(data.moments) ? data.moments : [],
      wins: Array.isArray(data.wins) ? data.wins : [],
      misses: Array.isArray(data.misses) ? data.misses : [],
    };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { themes: [], moments: [], wins: [], misses: [] };
    }
    throw err;
  }
}

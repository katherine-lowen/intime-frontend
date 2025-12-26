import api from "./api";

type WithData<T> = T | { data?: T };

function fromRes<T>(res: any): T {
  if (Array.isArray(res)) return res as T;
  if (Array.isArray(res?.data)) return res.data as T;
  return res as T;
}

export async function listCompChanges(
  orgSlug: string,
  params?: { status?: string; employeeId?: string }
) {
  const qs = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/payroll/comp-changes?${qs}`);
  return fromRes<any[]>(res) || [];
}

export async function createCompChange(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/payroll/comp-changes", { orgSlug, ...payload });
}

export async function getCompChange(orgSlug: string, id: string) {
  return api.get<any>(`/payroll/comp-changes/${id}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function decideCompChange(
  orgSlug: string,
  id: string,
  payload: { decision: "APPROVE" | "REJECT"; note?: string }
) {
  return api.post<any>(`/payroll/comp-changes/${id}/decision`, { orgSlug, ...payload });
}

export async function applyCompChange(orgSlug: string, id: string) {
  return api.post<any>(`/payroll/comp-changes/${id}/apply`, { orgSlug });
}

export async function exportCompChange(orgSlug: string, id: string) {
  return api.get<any>(`/payroll/comp-changes/${id}/export?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function listPayrollActions(orgSlug: string, filters?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(filters || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/payroll/actions?${qs}`);
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any)?.data)) return (res as any).data;
  return [];
}

export async function getPayrollAction(orgSlug: string, actionId: string) {
  return api.get<any>(`/payroll/actions/${actionId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function listAnomalies(orgSlug: string, filters?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(filters || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/payroll/anomalies?${qs}`);
  return fromRes<any[]>(res) || [];
}

export async function resolveAnomaly(orgSlug: string, anomalyId: string) {
  return api.post<any>(`/payroll/anomalies/${anomalyId}/resolve`, { orgSlug });
}

export async function runAnomalyScan(orgSlug: string) {
  return api.post<any>("/payroll/anomalies/run", { orgSlug });
}

export async function listPayBands(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/payroll/bands?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromRes<any[]>(res) || [];
}

export async function createPayBand(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/payroll/bands", { orgSlug, ...payload });
}

export async function updatePayBand(orgSlug: string, bandId: string, payload: Record<string, any>) {
  return api.patch<any>(`/payroll/bands/${bandId}`, { orgSlug, ...payload });
}

export async function deletePayBand(orgSlug: string, bandId: string) {
  return api.delete<any>(`/payroll/bands/${bandId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

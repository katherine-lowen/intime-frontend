import api from "./api";

type WithData<T> = T | { data?: T };

function unwrap<T>(res: any): T {
  if (Array.isArray(res)) return res as T;
  if (Array.isArray(res?.data)) return res.data as T;
  return res as T;
}

export async function getImpact(orgSlug: string, params?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  return api.get<any>(`/payroll/reports/impact?${qs}`);
}

export async function getChanges(orgSlug: string, params?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/payroll/reports/changes?${qs}`);
  return unwrap<any[]>(res) || [];
}

export async function getForecast(orgSlug: string, params?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  return api.get<any>(`/payroll/reports/forecast?${qs}`);
}

export async function listAlerts(orgSlug: string, params?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/payroll/reports/alerts?${qs}`);
  return unwrap<any[]>(res) || [];
}

export async function runAlerts(orgSlug: string) {
  return api.post<any>("/payroll/reports/alerts/run", { orgSlug });
}

import api from "./api";

type WithData<T> = T | { data?: T };

function fromRes<T>(res: any): T {
  if (Array.isArray(res)) return res as T;
  if (Array.isArray(res?.data)) return res.data as T;
  return res as T;
}

export async function getQboHealth(orgSlug: string) {
  return api.get<any>(`/payroll/qbo/health?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function runQboReconcile(orgSlug: string) {
  return api.post<any>("/payroll/qbo/reconcile", { orgSlug });
}

export async function listQboIssues(orgSlug: string, filters?: Record<string, any>) {
  const qs = new URLSearchParams({ orgSlug, ...(filters || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/payroll/qbo/issues?${qs}`);
  return fromRes<any[]>(res) || [];
}

export async function getQboDiff(orgSlug: string, employeeId: string) {
  return api.get<any>(
    `/payroll/qbo/diff/${employeeId}?orgSlug=${encodeURIComponent(orgSlug)}`
  );
}

export async function resolveQboIssue(orgSlug: string, issueId: string) {
  return api.post<any>(`/payroll/qbo/issues/${issueId}/resolve`, { orgSlug });
}

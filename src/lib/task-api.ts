import api from "./api";

type WithData<T> = T | { data?: T };

function fromRes<T>(res: any): T {
  if (Array.isArray(res)) return res as T;
  if (Array.isArray(res?.data)) return res.data as T;
  return res as T;
}

export async function listTasks(orgSlug: string, params?: { status?: string }) {
  const qs = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/tasks?${qs}`);
  return fromRes<any[]>(res) || [];
}

export async function completeTask(orgSlug: string, taskId: string) {
  return api.post<any>(`/tasks/${taskId}/complete`, { orgSlug });
}

export async function dismissTask(orgSlug: string, taskId: string) {
  return api.post<any>(`/tasks/${taskId}/dismiss`, { orgSlug });
}

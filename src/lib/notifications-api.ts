import api from "./api";

type WithData<T> = T | { data?: T };

function fromRes<T>(res: any): T {
  if (Array.isArray(res)) return res as T;
  if (Array.isArray(res?.data)) return res.data as T;
  return res as T;
}

export async function listNotifications(
  orgSlug: string,
  params?: { status?: string; cursor?: string; limit?: number }
) {
  const search = new URLSearchParams({ orgSlug });
  if (params?.status) search.set("status", params.status);
  if (params?.cursor) search.set("cursor", params.cursor);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await api.get<WithData<any[]>>(`/notifications?${qs}`);
  return fromRes<any[]>(res) || [];
}

export async function unreadCount(orgSlug: string) {
  const res = await api.get<any>(`/notifications/unread-count?orgSlug=${encodeURIComponent(orgSlug)}`);
  if (typeof res === "number") return res;
  if (typeof res?.count === "number") return res.count;
  return 0;
}

export async function markRead(orgSlug: string, id: string) {
  return api.post<any>(`/notifications/${id}/read`, { orgSlug });
}

export async function markAllRead(orgSlug: string) {
  return api.post<any>("/notifications/read-all", { orgSlug });
}

export async function getPreferences(orgSlug: string) {
  return api.get<any>(`/notifications/preferences?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function updatePreferences(orgSlug: string, patch: Record<string, any>) {
  return api.patch<any>("/notifications/preferences", { orgSlug, ...patch });
}

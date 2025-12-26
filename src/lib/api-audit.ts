import api from "@/lib/api";

type OrgLookup = {
  id: string;
  slug: string;
};

export type AuditLog = {
  id?: string;
  createdAt: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  actorId?: string | null;
  requestId?: string | null;
  [key: string]: any;
};

async function fetchOrgBySlug(orgSlug: string): Promise<OrgLookup | null> {
  try {
    const res = await api.get<{ data?: OrgLookup; id?: string; slug?: string }>(
      `/org/lookup?slug=${encodeURIComponent(orgSlug)}`
    );
    if (res?.data?.id) return { id: res.data.id, slug: res.data.slug };
    if (res?.id) return { id: res.id, slug: res.slug || orgSlug };
    return null;
  } catch {
    return null;
  }
}

export async function listAuditLogs(
  orgSlug: string,
  opts?: { limit?: number }
): Promise<AuditLog[]> {
  const org = await fetchOrgBySlug(orgSlug);
  if (!org?.id) throw new Error("Organization not found");
  const limit = opts?.limit ?? 50;
  const res = await api.get<AuditLog[]>(`/orgs/${org.id}/audit-logs?limit=${limit}`);
  return Array.isArray(res) ? res : [];
}

import api from "@/lib/api";

type OrgLookup = {
  id: string;
  slug: string;
};

export type SeatStatus = {
  plan: string | null;
  subscriptionStatus?: string | null;
  seatsUsed: number;
  seatsAllowed: number;
  overLimit: boolean;
  _requestId?: string | null;
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

export async function getSeatStatus(orgSlug: string): Promise<SeatStatus> {
  const org = await fetchOrgBySlug(orgSlug);
  if (!org?.id) throw new Error("Organization not found");
  const res = await api.get<SeatStatus>(`/orgs/${org.id}/seats/status`);
  return res;
}

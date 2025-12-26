import api from "@/lib/api";

type OrgLookup = {
  id: string;
  slug: string;
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

export async function sendTestEmail(
  orgSlug: string,
  payload: { to: string; type: "invite" | "application_confirmation" }
): Promise<{ requestId?: string | null }> {
  const org = await fetchOrgBySlug(orgSlug);
  if (!org?.id) throw new Error("Organization not found");
  const res = await api.post<{ requestId?: string | null }>(
    `/orgs/${org.id}/settings/test-email`,
    payload
  );
  return res ?? {};
}

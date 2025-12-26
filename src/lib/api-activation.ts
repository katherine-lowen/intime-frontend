import api from "@/lib/api";

type OrgLookup = {
  id: string;
  slug: string;
};

export type ActivationStatusResponse = {
  completedKeys?: string[];
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

export async function getActivationStatus(orgSlug: string): Promise<ActivationStatusResponse | null> {
  try {
    const org = await fetchOrgBySlug(orgSlug);
    if (!org?.id) return null;
    const res = await api.get<ActivationStatusResponse>(`/orgs/${org.id}/activation-status`);
    return res ?? null;
  } catch (err) {
    console.warn("[activation] failed to fetch status", err);
    return null;
  }
}


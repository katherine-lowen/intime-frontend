import api from "@/lib/api";

type OrgLookup = {
  id: string;
  slug: string;
};

type AiDraftParams = {
  tone?: string;
  length?: string;
  focus?: string;
  bullets?: boolean;
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

export async function aiDraftPerformanceReview(
  orgSlug: string,
  reviewId: string,
  params: AiDraftParams
): Promise<string> {
  const org = await fetchOrgBySlug(orgSlug);
  if (!org?.id) {
    throw new Error("Org not found");
  }
  const res = await api.post<{ draft?: string }>(
    `/orgs/${org.id}/performance/reviews/${reviewId}/ai-draft`,
    params
  );
  if (typeof res === "string") return res;
  return res?.draft ?? "";
}

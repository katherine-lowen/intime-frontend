import api from "@/lib/api";

type OrgLookup = {
  id: string;
  slug: string;
};

export type ImportRow = {
  rowNumber: number;
  status: "valid" | "error" | "skipped";
  data: Record<string, string>;
  errors?: string[];
};

export type ImportPreview = {
  parsedCount: number;
  validCount: number;
  invalidCount: number;
  rows: ImportRow[];
  seatsUsed?: number;
  seatsAllowed?: number;
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

export async function previewEmployeeImport(orgSlug: string, csvText: string): Promise<ImportPreview> {
  const org = await fetchOrgBySlug(orgSlug);
  if (!org?.id) throw new Error("Organization not found");
  const res = await api.post<ImportPreview>(`/orgs/${org.id}/people/import/preview`, { csv: csvText });
  return res;
}

export async function commitEmployeeImport(
  orgSlug: string,
  csvText: string,
  options?: { sendInvites?: boolean; inviteOnlyNew?: boolean; defaultRole?: string }
): Promise<any> {
  const org = await fetchOrgBySlug(orgSlug);
  if (!org?.id) throw new Error("Organization not found");
  const res = await api.post<any>(`/orgs/${org.id}/people/import/commit`, {
    csv: csvText,
    ...options,
  });
  return res;
}

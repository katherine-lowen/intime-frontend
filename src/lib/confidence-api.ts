import api from "./api";

export type ConfidenceEntry = {
  date?: string;
  before?: number | null;
  after?: number | null;
};

export async function getConfidence(orgSlug: string, key: string) {
  return api.get<{ confidence?: number }>(
    `/confidence/${encodeURIComponent(key)}?orgSlug=${encodeURIComponent(orgSlug)}`
  );
}

export async function listConfidenceTrends(
  orgSlug: string,
  key: string,
  take?: number,
  cursor?: string
) {
  const params = new URLSearchParams({ orgSlug });
  if (take != null) params.set("take", String(take));
  if (cursor) params.set("cursor", cursor);
  return api.get<{ data?: ConfidenceEntry[]; cursor?: string }>(
    `/confidence/${encodeURIComponent(key)}/trends?${params.toString()}`
  );
}

import api from "./api";

type SearchParams = { q: string; limit?: number; types?: string[] };

export async function search(orgSlug: string, params: SearchParams) {
  const searchParams = new URLSearchParams({ orgSlug, q: params.q });
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (Array.isArray(params.types) && params.types.length) {
    searchParams.set("types", params.types.join(","));
  }
  const res = await api.get<any>(`/search?${searchParams.toString()}`);
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

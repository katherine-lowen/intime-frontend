import api from "./api";

export type ConfidenceSummary = {
  confidence?: number | null;
  delta?: number | null;
};

function normalize(res: any): ConfidenceSummary | null {
  if (!res) return null;
  const data = res?.data ?? res;
  return {
    confidence: data?.confidence ?? data?.score ?? null,
    delta: data?.delta ?? data?.change ?? data?.trend ?? null,
  };
}

export async function getConfidenceSummary(orgSlug: string, key: string): Promise<ConfidenceSummary | null> {
  try {
    const res = await api.get<any>(
      `/intelligence/confidence/${encodeURIComponent(key)}?orgSlug=${encodeURIComponent(orgSlug)}`
    );
    return normalize(res);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

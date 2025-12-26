import api from "./api";

export type OutcomeEvidence = {
  title?: string | null;
  summary?: string | null;
  href?: string | null;
};

export type OutcomeSuggestion = {
  suggestedOutcomeStatus?: string | null;
  note?: string | null;
  confidence?: number | null;
  evidence?: OutcomeEvidence[];
  recommendationKey?: string | null;
};

function normalize(res: any): OutcomeSuggestion | null {
  if (!res) return null;
  const suggestion = res?.suggestion ?? res;
  return {
    suggestedOutcomeStatus: suggestion?.suggestedOutcomeStatus ?? suggestion?.status ?? null,
    note: suggestion?.note ?? suggestion?.summary ?? null,
    confidence: suggestion?.confidence ?? null,
    evidence: Array.isArray(suggestion?.evidence)
      ? suggestion.evidence.map((e: any) => ({
          title: e?.title ?? e?.label ?? null,
          summary: e?.summary ?? e?.detail ?? null,
          href: e?.href ?? e?.link ?? null,
        }))
      : [],
    recommendationKey: suggestion?.recommendationKey ?? null,
  };
}

export async function getOutcomeSuggestion(orgSlug: string, decisionId: string): Promise<OutcomeSuggestion | null> {
  try {
    const res = await api.get<any>(
      `/intelligence/decisions/${decisionId}/outcome-suggestion?orgSlug=${encodeURIComponent(orgSlug)}`
    );
    return normalize(res);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function generateOutcomeSuggestion(orgSlug: string, decisionId: string): Promise<OutcomeSuggestion | null> {
  try {
    const res = await api.post<any>(`/intelligence/decisions/${decisionId}/outcome-suggestion`, { orgSlug });
    return normalize(res);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function dismissOutcomeSuggestion(orgSlug: string, decisionId: string) {
  try {
    await api.post(`/intelligence/decisions/${decisionId}/outcome-suggestion/dismiss`, { orgSlug });
  } catch (err: any) {
    if (err?.response?.status === 404) return;
    throw err;
  }
}

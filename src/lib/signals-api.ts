import api from "./api";

export type OrgSignal = {
  key?: string | null;
  label?: string | null;
  value?: string | number | null;
  trend?: string | number | null;
  delta?: string | number | null;
  change?: string | number | null;
  href?: string | null;
};

function normalizeSignals(res: any): OrgSignal[] {
  const raw = Array.isArray(res)
    ? res
    : Array.isArray(res?.signals)
    ? res.signals
    : Array.isArray(res?.data)
    ? res.data
    : [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((sig) => ({
      key: sig?.key ?? sig?.id ?? null,
      label: sig?.label ?? sig?.name ?? sig?.title ?? sig?.key ?? sig?.id ?? null,
      value: sig?.value ?? sig?.count ?? sig?.metric ?? sig?.total ?? null,
      trend: sig?.trend ?? sig?.delta ?? sig?.change ?? null,
      delta: sig?.delta ?? null,
      change: sig?.change ?? null,
      href: sig?.href ?? sig?.link ?? null,
    }))
    .filter((sig) => sig.label);
}

export async function getOrgSignals(orgSlug: string): Promise<OrgSignal[]> {
  try {
    const res = await api.get<any>(`/orgs/${orgSlug}/signals`);
    return normalizeSignals(res);
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

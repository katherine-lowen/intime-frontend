import api from "./api";

export type HiringSignal = {
  id: string;
  title?: string | null;
  summary?: string | null;
  department?: string | null;
  category?: string | null;
  status?: string | null;
  priority?: string | number | null;
  recommendationKey?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  suggestedRole?: string | null;
  suggestedLocation?: string | null;
};

export type HeadcountTarget = {
  id?: string;
  department?: string | null;
  title?: string | null;
  targetCount?: number | null;
  actualCount?: number | null;
};

export type HeadcountPlan = {
  id: string;
  name?: string | null;
  status?: string | null;
  summary?: string | null;
  targets?: HeadcountTarget[];
  totalTarget?: number | null;
  totalActual?: number | null;
};

function normalizeSignals(res: any): HiringSignal[] {
  const raw = Array.isArray(res)
    ? res
    : Array.isArray(res?.signals)
    ? res.signals
    : Array.isArray(res?.data)
    ? res.data
    : [];

  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      id: String(item?.id ?? item?.signalId ?? Math.random().toString(36).slice(2)),
      title: item?.title ?? item?.message ?? item?.summary ?? null,
      summary: item?.summary ?? null,
      department: item?.department ?? item?.dept ?? null,
      category: item?.category ?? item?.type ?? null,
      status: item?.status ?? null,
      priority: item?.priority ?? item?.score ?? null,
      recommendationKey: item?.recommendationKey ?? null,
      sourceType: item?.sourceType ?? null,
      sourceId: item?.sourceId ?? null,
      suggestedRole: item?.role ?? item?.suggestedRole ?? item?.title ?? null,
      suggestedLocation: item?.location ?? null,
    }))
    .filter((s) => s.id);
}

function normalizePlans(res: any): HeadcountPlan[] {
  const raw = Array.isArray(res)
    ? res
    : Array.isArray(res?.plans)
    ? res.plans
    : Array.isArray(res?.data)
    ? res.data
    : [];
  if (!Array.isArray(raw)) return [];
  return raw.map((plan) => ({
    id: String(plan?.id ?? plan?.planId),
    name: plan?.name ?? plan?.title ?? "Plan",
    status: plan?.status ?? "draft",
    summary: plan?.summary ?? null,
    totalTarget: plan?.totalTarget ?? plan?.target ?? null,
    totalActual: plan?.totalActual ?? plan?.actual ?? null,
    targets: normalizeTargets(plan?.targets),
  }));
}

function normalizeTargets(raw: any): HeadcountTarget[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => ({
    id: t?.id ?? t?.targetId,
    department: t?.department ?? t?.dept ?? null,
    title: t?.title ?? t?.role ?? null,
    targetCount: typeof t?.targetCount === "number" ? t.targetCount : t?.target ?? null,
    actualCount: typeof t?.actualCount === "number" ? t.actualCount : t?.actual ?? null,
  }));
}

export async function listHiringSignals(orgSlug: string): Promise<HiringSignal[]> {
  try {
    const res = await api.get<any>(`/orgs/${orgSlug}/hiring/signals`);
    return normalizeSignals(res);
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export async function listHeadcountPlans(orgSlug: string): Promise<HeadcountPlan[]> {
  try {
    const res = await api.get<any>(`/orgs/${orgSlug}/headcount/plans`);
    return normalizePlans(res);
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export async function getHeadcountPlan(orgSlug: string, planId: string): Promise<HeadcountPlan | null> {
  try {
    const res = await api.get<any>(`/orgs/${orgSlug}/headcount/plans/${planId}`);
    const plans = normalizePlans(res);
    return plans[0] ?? (res?.id ? normalizePlans([res])[0] : null);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function updateHeadcountPlanStatus(orgSlug: string, planId: string, status: string) {
  const res = await api.patch<any>(`/orgs/${orgSlug}/headcount/plans/${planId}/status`, { status });
  const plans = normalizePlans(res);
  return plans[0] ?? null;
}

export async function updateHeadcountTargets(orgSlug: string, planId: string, targets: HeadcountTarget[]) {
  const res = await api.patch<any>(`/orgs/${orgSlug}/headcount/plans/${planId}/targets`, {
    targets: targets.map((t) => ({
      id: t.id,
      department: t.department,
      title: t.title,
      targetCount: t.targetCount,
    })),
  });
  const plans = normalizePlans(res);
  return plans[0] ?? null;
}

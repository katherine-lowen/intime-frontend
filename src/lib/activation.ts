export type ActivationStepId =
  | "create_job"
  | "add_candidate"
  | "generate_ai_summary"
  | "add_employee"
  | "invite_member";

export type ActivationState = {
  orgSlug: string;
  completed: Record<ActivationStepId, boolean>;
  dismissed?: boolean;
  updatedAt: number;
};

const defaultState = (orgSlug: string): ActivationState => ({
  orgSlug,
  completed: {
    create_job: false,
    add_candidate: false,
    generate_ai_summary: false,
    add_employee: false,
    invite_member: false,
  },
  dismissed: false,
  updatedAt: Date.now(),
});

const key = (orgSlug: string) => `intime_activation_${orgSlug}`;

export function loadActivation(orgSlug: string): ActivationState {
  if (typeof window === "undefined") return defaultState(orgSlug);
  try {
    const raw = window.localStorage.getItem(key(orgSlug));
    if (!raw) return defaultState(orgSlug);
    const parsed = JSON.parse(raw) as ActivationState;
    return {
      ...defaultState(orgSlug),
      ...parsed,
      completed: { ...defaultState(orgSlug).completed, ...(parsed.completed || {}) },
    };
  } catch {
    return defaultState(orgSlug);
  }
}

export function saveActivation(state: ActivationState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: Date.now() };
  window.localStorage.setItem(key(state.orgSlug), JSON.stringify(next));
}

export function markCompleted(orgSlug: string, stepId: ActivationStepId): ActivationState {
  const current = loadActivation(orgSlug);
  const next: ActivationState = {
    ...current,
    completed: { ...current.completed, [stepId]: true },
    dismissed: false,
    updatedAt: Date.now(),
  };
  saveActivation(next);
  return next;
}

export function dismissActivation(orgSlug: string): ActivationState {
  const current = loadActivation(orgSlug);
  const next: ActivationState = { ...current, dismissed: true, updatedAt: Date.now() };
  saveActivation(next);
  return next;
}

export function resetActivation(orgSlug: string): ActivationState {
  const next = defaultState(orgSlug);
  saveActivation(next);
  return next;
}

export type ActivationStatusPayload = {
  completedKeys?: string[];
};

export function reconcileActivation(orgSlug: string, status: ActivationStatusPayload | null) {
  if (!status) return loadActivation(orgSlug);
  const local = loadActivation(orgSlug);
  const completedKeys = new Set(status.completedKeys || []);
  const nextCompleted = { ...local.completed };
  (Object.keys(nextCompleted) as ActivationStepId[]).forEach((key) => {
    nextCompleted[key] = completedKeys.has(key);
  });
  const next: ActivationState = {
    ...local,
    completed: nextCompleted,
    updatedAt: Date.now(),
  };
  saveActivation(next);
  return next;
}

export function getProgressFromStatus(orgSlug: string, status: ActivationStatusPayload | null) {
  const state = status ? reconcileActivation(orgSlug, status) : loadActivation(orgSlug);
  const totalCount = Object.keys(state.completed).length;
  const completedKeys = (Object.entries(state.completed) as [ActivationStepId, boolean][])
    .filter(([, done]) => done)
    .map(([k]) => k);
  const completedCount = completedKeys.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percent, completedKeys };
}

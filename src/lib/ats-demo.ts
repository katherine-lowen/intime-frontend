import type { Candidate, Job } from "@/lib/ats-types";

type DemoState = {
  jobs: Job[];
  candidates: Record<string, Candidate[]>;
};

const stateKey = (orgSlug: string) => `ats-demo-${orgSlug}`;

const defaultState: DemoState = {
  jobs: [],
  candidates: {},
};

function loadState(orgSlug: string): DemoState {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(stateKey(orgSlug));
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as DemoState;
    return {
      jobs: parsed.jobs ?? [],
      candidates: parsed.candidates ?? {},
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState(orgSlug: string, state: DemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(stateKey(orgSlug), JSON.stringify(state));
}

const jobTitles = [
  "Product Manager",
  "Fullstack Engineer",
  "Account Executive",
  "Design Lead",
];

const departments = ["Product", "Engineering", "Sales", "Design"];
const locations = ["Remote", "San Francisco", "New York", "Austin"];

const firstNames = ["Jordan", "Alex", "Taylor", "Priya", "Sam", "Maya"];
const lastNames = ["Lee", "Chen", "Patel", "Garcia", "Kim", "Nakamura"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateJob(): Job {
  const title = randomItem(jobTitles);
  return {
    id: `demo-job-${Math.random().toString(36).slice(2, 8)}`,
    title,
    department: randomItem(departments),
    location: randomItem(locations),
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
}

function generateCandidate(_jobId: string): Candidate {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const email = `${firstName}.${lastName}`.toLowerCase() + "@example.com";
  return {
    id: `demo-cand-${Math.random().toString(36).slice(2, 8)}`,
    firstName,
    lastName,
    email,
    linkedInUrl: "https://www.linkedin.com/in/demo",
    stage: "APPLIED",
  } as Candidate;
}

export function getDemoJobs(orgSlug: string): Job[] {
  const state = loadState(orgSlug);
  return state.jobs;
}

export function getDemoJob(orgSlug: string, jobId: string): Job | null {
  return getDemoJobs(orgSlug).find((j) => j.id === jobId) ?? null;
}

export function getDemoCandidates(orgSlug: string, jobId: string): Candidate[] {
  const state = loadState(orgSlug);
  return state.candidates[jobId] ?? [];
}

export function seedDemoJobWithCandidates(orgSlug: string): { job: Job; candidates: Candidate[] } {
  const job = generateJob();
  const candidates = Array.from({ length: 3 }).map(() => generateCandidate(job.id));

  const state = loadState(orgSlug);
  const nextState: DemoState = {
    jobs: [job, ...state.jobs],
    candidates: {
      ...state.candidates,
      [job.id]: candidates,
    },
  };
  saveState(orgSlug, nextState);
  return { job, candidates };
}

export function seedDemoCandidates(
  orgSlug: string,
  jobId: string,
  count = 3
): Candidate[] {
  const additions = Array.from({ length: count }).map(() => generateCandidate(jobId));
  const state = loadState(orgSlug);
  const current = state.candidates[jobId] ?? [];
  const nextState: DemoState = {
    ...state,
    candidates: {
      ...state.candidates,
      [jobId]: [...current, ...additions],
    },
  };
  saveState(orgSlug, nextState);
  return additions;
}

export function upsertDemoJob(orgSlug: string, job: Job) {
  const state = loadState(orgSlug);
  const without = state.jobs.filter((j) => j.id !== job.id);
  const nextState: DemoState = {
    ...state,
    jobs: [job, ...without],
  };
  saveState(orgSlug, nextState);
}

export function upsertDemoCandidate(orgSlug: string, jobId: string, candidate: Candidate) {
  const state = loadState(orgSlug);
  const current = state.candidates[jobId] ?? [];
  const without = current.filter((c) => c.id !== candidate.id);
  const nextState: DemoState = {
    ...state,
    candidates: {
      ...state.candidates,
      [jobId]: [...without, candidate],
    },
  };
  saveState(orgSlug, nextState);
}

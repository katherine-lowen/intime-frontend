import { fetchEmployeesForOrg } from "@/lib/api-employees";
import {
  listJobs,
  listJobCandidates,
} from "@/lib/api-ats";
import type { Candidate, Job } from "@/lib/ats-types";

export type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  kind: "page" | "person" | "job" | "candidate" | "action";
};

const includesQuery = (value: string | null | undefined, query: string) =>
  value?.toLowerCase().includes(query.toLowerCase()) ?? false;

export async function searchPeople(orgSlug: string, query: string): Promise<SearchResult[]> {
  try {
    const people = await fetchEmployeesForOrg(orgSlug);
    return people
      .filter((p) => {
        const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
        return includesQuery(name, query) || includesQuery(p.email, query);
      })
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        title: [p.firstName, p.lastName].filter(Boolean).join(" "),
        subtitle: p.title || p.email || "",
        href: `/org/${orgSlug}/people/${p.id}`,
        kind: "person" as const,
      }));
  } catch (err) {
    console.warn("[command palette] search people failed", err);
    return [];
  }
}

export async function searchJobs(orgSlug: string, query: string): Promise<SearchResult[]> {
  try {
    const jobs: Job[] = await listJobs(orgSlug);
    return jobs
      .filter((j) => includesQuery(j.title, query) || includesQuery(j.department, query))
      .slice(0, 10)
      .map((j) => ({
        id: j.id,
        title: j.title,
        subtitle: [j.department, j.location].filter(Boolean).join(" · "),
        href: `/org/${orgSlug}/hiring/jobs/${j.id}`,
        kind: "job" as const,
      }));
  } catch (err) {
    console.warn("[command palette] search jobs failed", err);
    return [];
  }
}

export async function searchCandidates(orgSlug: string, query: string): Promise<SearchResult[]> {
  try {
    const jobs: Job[] = await listJobs(orgSlug);
    const topJobs = jobs.slice(0, 5);
    const candidates: Candidate[] = [];
    for (const job of topJobs) {
      try {
        const jobCandidates = await listJobCandidates(orgSlug, job.id);
        candidates.push(...jobCandidates);
      } catch (err) {
        console.warn("[command palette] list candidates failed for job", job.id, err);
      }
    }
    return candidates
      .filter((c) => {
        const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
        return includesQuery(name, query) || includesQuery(c.email, query);
      })
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        title: [c.firstName, c.lastName].filter(Boolean).join(" "),
        subtitle: c.email || "",
        href: `/org/${orgSlug}/hiring/candidates/${c.id}`,
        kind: "candidate" as const,
      }));
  } catch (err) {
    console.warn("[command palette] search candidates failed", err);
    return [];
  }
}

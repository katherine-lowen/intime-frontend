import api from "./api";

export async function getHealth(orgSlug: string) {
  return api.get<any>(`/orgs/${orgSlug}/ops/healthcheck`);
}

export async function getSanity(orgSlug: string) {
  return api.get<any>(`/orgs/${orgSlug}/ops/sanity`);
}

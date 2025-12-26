import api from "./api";

export async function getManagerHome(orgSlug: string) {
  return api.get<any>(`/manager/home?orgSlug=${encodeURIComponent(orgSlug)}`);
}

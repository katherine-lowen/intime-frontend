import api from "./api";

export async function getEmployeeHome(orgSlug: string) {
  return api.get<any>(`/employee/home?orgSlug=${encodeURIComponent(orgSlug)}`);
}

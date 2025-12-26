import api from "./api";

export async function acceptInvite(
  token: string,
  payload: { name?: string; password?: string }
) {
  return api.post<any>(`/auth/invite/accept`, { token, ...payload });
}

export async function requestPasswordReset(email: string) {
  return api.post<any>(`/auth/password/reset/request`, { email });
}

export async function confirmPasswordReset(token: string, password: string) {
  return api.post<any>(`/auth/password/reset/confirm`, { token, password });
}

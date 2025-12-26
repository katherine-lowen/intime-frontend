import api, { API_BASE_URL } from "@/lib/api";

type OrgLookup = { id?: string; data?: { id: string } };

async function resolveOrgId(orgSlug: string): Promise<string> {
  const res = await api.get<OrgLookup>(`/org/lookup?slug=${encodeURIComponent(orgSlug)}`);
  return res?.id || res?.data?.id || orgSlug;
}

async function requestWithOrg<T>(
  orgSlug: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const orgId = await resolveOrgId(orgSlug);
  const res = await fetch(`${API_BASE_URL}${path.replace(":orgId", orgId)}`, {
    credentials: "include",
    method: init?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgSlug,
      ...(init?.headers || {}),
    },
    body: init?.body,
  });
  const requestId = res.headers.get("x-request-id");
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const err: any = new Error((data as any)?.message || `Request failed (${res.status})`);
    err.requestId = requestId;
    err.response = { status: res.status, data };
    throw err;
  }
  const result: any = data;
  if (result && typeof result === "object") result._requestId = requestId;
  return result as T;
}

export type MemberRecord = {
  id: string;
  email: string;
  name?: string | null;
  role: "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";
  status?: string;
};

export type InviteRecord = {
  id: string;
  email: string;
  role: MemberRecord["role"];
  invitedBy?: string | null;
  createdAt?: string;
  expiresAt?: string;
};

export async function listMembers(orgSlug: string) {
  return requestWithOrg<MemberRecord[]>(orgSlug, `/orgs/:orgId/members`);
}

export async function listInvites(orgSlug: string) {
  return requestWithOrg<InviteRecord[]>(orgSlug, `/orgs/:orgId/members/invites`);
}

export async function resendInvite(orgSlug: string, inviteId: string) {
  return requestWithOrg<void>(orgSlug, `/orgs/:orgId/members/invites/${inviteId}/resend`, {
    method: "POST",
  });
}

export async function revokeInvite(orgSlug: string, inviteId: string) {
  return requestWithOrg<void>(orgSlug, `/orgs/:orgId/members/invites/${inviteId}`, {
    method: "DELETE",
  });
}

export async function updateMemberRole(
  orgSlug: string,
  memberId: string,
  role: MemberRecord["role"]
) {
  return requestWithOrg<MemberRecord>(orgSlug, `/orgs/:orgId/members/${memberId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type OrgMember = {
  userId: string;
  employeeId?: string | null;
  email: string;
  name?: string | null;
  role: OrgRole;
  status: "ACTIVE" | "INVITED" | "DISABLED";
};

type OrgInvite = {
  id: string;
  email: string;
  role: OrgRole;
  createdAt?: string;
  status?: string;
};

export default function MembersPage() {
  const [role, setRole] = useState<OrgRole | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("EMPLOYEE");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const isAdminOwner = useMemo(
    () => role === "OWNER" || role === "ADMIN",
    [role]
  );
  const isEmployee = role === "EMPLOYEE";

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [membersRes, invitesRes] = await Promise.allSettled([
        api.get<OrgMember[]>("/org/members"),
        api.get<OrgInvite[]>("/org/invites"),
      ]);

      if (membersRes.status === "fulfilled") {
        setMembers(membersRes.value ?? []);
      } else {
        setError("Failed to load members.");
      }

      if (invitesRes.status === "fulfilled") {
        setInvites(invitesRes.value ?? []);
      }
    } catch (err: any) {
      console.error("[settings/members] fetch failed", err);
      setError(err?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const me = await getCurrentUser();
      const normalizedRole = (me?.role || "").toUpperCase() as OrgRole;
      if (!cancelled) setRole(normalizedRole);
      if (normalizedRole === "EMPLOYEE") {
        // Employees should not access; send to employee home
        window.location.replace("/employee");
        return;
      }
      await load();
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: OrgRole) => {
    if (!isAdminOwner) return;
    setSaving(userId);
    try {
      await api.patch(`/org/members/${userId}/role`, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      console.error("[settings/members] role update failed", err);
      setError(err?.message || "Failed to update role.");
    } finally {
      setSaving(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOwner) return;
    if (!inviteEmail.trim()) {
      setInviteError("Email is required.");
      return;
    }
    setInviteError(null);
    try {
      await api.post("/org/invites", {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("EMPLOYEE");
      setInviteOpen(false);
      const pendingInvites = await api.get<OrgInvite[]>("/org/invites");
      setInvites(pendingInvites ?? []);
    } catch (err: any) {
      console.error("[settings/members] invite failed", err);
      setInviteError(err?.message || "Failed to send invite.");
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 w-48 rounded bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Settings · Members
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Organization members
              </h1>
              <p className="text-sm text-slate-600">
                Manage roles and invitations for your workspace.
              </p>
            </div>
            {isAdminOwner && (
              <button
                onClick={() => setInviteOpen((v) => !v)}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                type="button"
              >
                Invite member
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            renderSkeleton()
          ) : (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                  <div className="col-span-4">Member</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1" />
                </div>
                {members.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-600">
                    No members found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {members.map((member) => (
                      <div
                        key={member.userId}
                        className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-slate-800"
                      >
                        <div className="col-span-4 font-medium">
                          {member.name || "—"}
                        </div>
                        <div className="col-span-3 text-slate-600">
                          {member.email}
                        </div>
                        <div className="col-span-2">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member.userId,
                                e.target.value as OrgRole
                              )
                            }
                            disabled={!isAdminOwner || saving === member.userId}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 disabled:cursor-not-allowed"
                          >
                            <option value="OWNER">Owner</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="EMPLOYEE">Employee</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            {member.status}
                          </span>
                        </div>
                        <div className="col-span-1 text-right text-xs text-slate-500">
                          {saving === member.userId ? "Saving…" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isAdminOwner && inviteOpen && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Invite a member
                    </h2>
                    <p className="text-xs text-slate-600">
                      Send an email invite to join this organization.
                    </p>
                  </div>
                  {inviteError && (
                    <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      {inviteError}
                    </div>
                  )}
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleInvite}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Role *
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EMPLOYEE">Employee</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setInviteOpen(false)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                      >
                        Send invite
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {isAdminOwner && invites.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Pending invites
                    </h3>
                    <p className="text-xs text-slate-600">
                      Invites awaiting acceptance.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-slate-800"
                      >
                        <div>
                          <div className="font-medium">{invite.email}</div>
                          <div className="text-xs text-slate-500">
                            Sent {invite.createdAt?.slice(0, 10) ?? "—"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                            {invite.role}
                          </span>
                          {invite.status && (
                            <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-500">
                              {invite.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

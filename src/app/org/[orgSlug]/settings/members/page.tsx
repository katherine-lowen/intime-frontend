"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { markCompleted } from "@/lib/activation";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import {
  InviteRecord,
  MemberRecord,
  listInvites,
  listMembers,
  resendInvite,
  revokeInvite,
  updateMemberRole,
} from "@/lib/api-members";
import api from "@/lib/api";
import { toast } from "sonner";

const ROLE_OPTIONS: MemberRecord["role"][] = ["OWNER", "ADMIN", "MANAGER", "EMPLOYEE"];

export default function OrgMembersPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const router = useRouter();
  const { orgId, orgName, role, isOwner, isAdmin, loading: orgLoading } = useCurrentOrg();

  const [email, setEmail] = useState("");
  const [roleInput, setRoleInput] = useState<MemberRecord["role"]>("EMPLOYEE");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage = useMemo(() => isOwner || isAdmin, [isOwner, isAdmin]);

  const load = async () => {
    if (!orgSlug) return;
    try {
      setLoadingMembers(true);
      const [m, i] = await Promise.all([listMembers(orgSlug), canManage ? listInvites(orgSlug) : Promise.resolve([])]);
      setMembers(m || []);
      if (canManage) setInvites(i || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Unable to load members right now.");
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSlug, canManage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !orgId) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await api.post("/org/members/invite", {
        email: email.trim(),
        role: roleInput,
        orgId,
      });
      if (orgSlug) markCompleted(orgSlug, "invite_member");
      setMessage("Invite sent!");
      setEmail("");
      setRoleInput("EMPLOYEE");
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to send invite right now.";
      setError(typeof msg === "string" ? msg : "Invite failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (inviteId: string) => {
    if (!orgSlug) return;
    try {
      await resendInvite(orgSlug, inviteId);
      toast.success("Invite resent");
    } catch (err: any) {
      toast.error(err?.message || "Unable to resend invite", {
        description: err?.requestId ? `Request ${err.requestId}` : undefined,
      } as any);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (!orgSlug) return;
    try {
      await revokeInvite(orgSlug, inviteId);
      toast.success("Invite revoked");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Unable to revoke invite", {
        description: err?.requestId ? `Request ${err.requestId}` : undefined,
      } as any);
    }
  };

  const handleRoleChange = async (member: MemberRecord, newRole: MemberRecord["role"]) => {
    if (!orgSlug) return;
    if (member.role === newRole) return;
    const confirmChange = window.confirm(
      `Change ${member.email} role from ${member.role} to ${newRole}?`
    );
    if (!confirmChange) return;
    try {
      await updateMemberRole(orgSlug, member.id, newRole);
      toast.success("Role updated");
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update role.";
      toast.error(msg, {
        description: err?.requestId ? `Request ${err.requestId}` : undefined,
      } as any);
    }
  };

  if (orgLoading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-slate-500">Loading organization…</p>
      </div>
    );
  }

  if (!orgSlug) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-slate-600">Organization not found.</p>
        <Button className="mt-3" onClick={() => router.refresh()}>
          Refresh
        </Button>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Members</h1>
          <p className="mt-2 text-sm text-slate-600">
            You don&apos;t have access to manage members. Contact an admin or owner.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => router.push(`/org/${orgSlug}/settings`)}>
            Back to settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Organization settings
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Members
        </h1>
        <p className="text-sm text-slate-500">
          Invite teammates to {orgName || "this workspace"}. Only owners and admins can invite.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Invite member</h2>
          <p className="text-sm text-slate-500">
            Send an email invite with a role for this organization.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="teammate@company.com"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as MemberRecord["role"])}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ROLE_OPTIONS.filter((r) => (isOwner ? true : r !== "OWNER")).map((r) => (
                  <option key={r} value={r}>
                    {r.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {message && <p className="text-xs text-emerald-600">{message}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending invite..." : "Send invite"}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Current members</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => load()}
            >
              Refresh
            </Button>
          </div>
          {loadingMembers ? (
            <p className="mt-3 text-sm text-slate-500">Loading members…</p>
          ) : members.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No members found for this org yet.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {members.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {m.name || m.email}
                    </div>
                    <div className="text-[12px] text-slate-500">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-200 text-[11px] capitalize">
                      {m.role.toLowerCase()}
                    </Badge>
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m, e.target.value as MemberRecord["role"])}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      disabled={!isOwner && m.role === "OWNER"}
                    >
                      {ROLE_OPTIONS.filter((r) => (isOwner ? true : r !== "OWNER")).map((r) => (
                        <option key={r} value={r} disabled={!isOwner && r === "OWNER"}>
                          {r.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {canManage ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pending invites</h2>
              <p className="text-sm text-slate-500">
                Resend or revoke invites that haven&apos;t been accepted yet.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => load()}>
              Refresh
            </Button>
          </div>
          {invites.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No pending invites.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Invited by</th>
                    <th className="pb-2">Sent</th>
                    <th className="pb-2">Expires</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invites.map((invite) => (
                    <tr key={invite.id}>
                      <td className="py-2">{invite.email}</td>
                      <td className="py-2 capitalize text-slate-700">{invite.role?.toLowerCase()}</td>
                      <td className="py-2 text-slate-600">{invite.invitedBy || "—"}</td>
                      <td className="py-2 text-slate-600">
                        {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2 text-slate-600">
                        {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResend(invite.id)}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(invite.id)}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

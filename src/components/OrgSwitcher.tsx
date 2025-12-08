"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Building2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type UserOrg = {
  orgId: string;
  orgName: string;
  role: string;
  isDefault: boolean;
};

export function OrgSwitcher() {
  const [orgs, setOrgs] = useState<UserOrg[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const me = await getCurrentUser();
        if (!cancelled && me?.org?.id) setCurrentOrgId(me.org.id);
        const data = await api.get<UserOrg[]>("/me/orgs");
        if (!cancelled) setOrgs(data ?? []);
      } catch (err) {
        console.error("[OrgSwitcher] failed to load orgs", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const multiple = useMemo(() => orgs.length > 1, [orgs]);
  const currentOrg = useMemo(
    () =>
      orgs.find((o) => o.orgId === currentOrgId) ||
      orgs.find((o) => o.isDefault) ||
      orgs[0],
    [currentOrgId, orgs]
  );

  const handleSwitch = async (orgId: string) => {
    if (saving || orgId === currentOrgId) return;
    setSaving(true);
    try {
      await api.patch("/me/current-org", { orgId });
      setCurrentOrgId(orgId);
      window.location.reload();
    } catch (err) {
      console.error("[OrgSwitcher] failed to switch org", err);
    } finally {
      setSaving(false);
    }
  };

  if (!multiple) {
    return (
      <div className="mb-4 inline-flex w-full items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] text-[#E5E7EB]">
        <Building2 className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={1.6} />
        <span className="truncate">{currentOrg?.orgName ?? "Your org"}</span>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="text-[11px] uppercase tracking-wide text-[#6B7280]">
        Organizations
      </div>
      <div className="space-y-1">
        {orgs.map((org) => {
          const active = org.orgId === currentOrgId;
          return (
            <button
              key={org.orgId}
              onClick={() => handleSwitch(org.orgId)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-[13px] transition-colors ${
                active
                  ? "border-indigo-400/50 bg-indigo-500/10 text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-[#E5E7EB] hover:bg-white/[0.06]"
              }`}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Building2
                  className="h-3.5 w-3.5 text-[#9CA3AF]"
                  strokeWidth={1.6}
                />
                <span className="truncate">{org.orgName}</span>
              </span>
              {saving && org.orgId === currentOrgId ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
              ) : (
                <ChevronsUpDown className="h-3 w-3 text-[#6B7280]" strokeWidth={1.6} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

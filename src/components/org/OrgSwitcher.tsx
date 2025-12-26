"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

function RoleBadge({ role }: { role: string }) {
  const normalized = role?.toUpperCase?.() || "";
  const color =
    normalized === "OWNER" || normalized === "ADMIN"
      ? "bg-indigo-100 text-indigo-700"
      : normalized === "MANAGER"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";
  return (
    <Badge className={`px-2 py-1 text-[11px] font-semibold ${color}`} variant="secondary">
      {normalized.toLowerCase() || "member"}
    </Badge>
  );
}

export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { orgs, orgSlug, orgName, role, loading, switchOrg } = useCurrentOrg();
  const [saving, setSaving] = useState<string | null>(null);

  const multiple = orgs.length > 1;
  const sorted = useMemo(
    () =>
      [...orgs].sort((a, b) =>
        a.orgName.localeCompare(b.orgName, undefined, { sensitivity: "base" })
      ),
    [orgs]
  );

  const handleSelect = async (slug: string) => {
    if (!slug || slug === orgSlug || saving) return;
    setSaving(slug);
    switchOrg(slug);
    setSaving(null);
    // if already on org route, refresh to refetch data
    if (pathname?.startsWith("/org/")) {
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        Loading orgs…
      </div>
    );
  }

  if (!orgSlug) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 shadow-sm">
        <Building2 className="h-4 w-4" />
        No organization
      </div>
    );
  }

  if (!multiple) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
        <Building2 className="h-4 w-4 text-slate-500" />
        <span className="truncate">{orgName || orgSlug}</span>
        {role ? <RoleBadge role={role} /> : null}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 rounded-md border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
        >
          <Building2 className="h-4 w-4 text-slate-500" />
          <span className="max-w-[150px] truncate text-left">{orgName || orgSlug}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-slate-500">
          Switch organization
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sorted.map((org) => {
          const isActive = org.orgSlug === orgSlug;
          return (
            <DropdownMenuItem
              key={org.orgId}
              onClick={() => handleSelect(org.orgSlug)}
              className="flex items-start justify-between gap-2 py-2"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{org.orgName}</span>
                  <span className="text-[11px] text-slate-500">{org.orgSlug}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={org.role} />
                {saving === org.orgSlug ? (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                ) : isActive ? (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                    Active
                  </span>
                ) : null}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

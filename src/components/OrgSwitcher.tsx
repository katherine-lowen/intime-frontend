"use client";

import { Building2, ChevronsUpDown } from "lucide-react";

export function OrgSwitcher() {
  return (
    <button
      className="mb-4 w-full inline-flex items-center justify-between rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] text-[#E5E7EB] hover:bg-white/[0.06] transition-colors"
      type="button"
    >
      <span className="flex items-center gap-2">
        <Building2 className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={1.6} />
        <span className="truncate">Acme Inc</span>
      </span>
      <ChevronsUpDown className="h-3 w-3 text-[#6B7280]" strokeWidth={1.6} />
    </button>
  );
}

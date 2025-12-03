"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 text-[13px] text-[#9CA3AF]">
        <Search className="h-3.5 w-3.5 text-[#6B7280]" strokeWidth={1.5} />
        <span className="truncate">Search</span>
      </div>
    </div>
  );
}

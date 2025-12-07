"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event("intime-open-command-palette"))
      }
      className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 text-left text-[13px] text-[#9CA3AF] transition hover:border-white/[0.12] hover:bg-white/[0.06]"
    >
      <Search className="h-3.5 w-3.5 text-[#6B7280]" strokeWidth={1.5} />
      <span className="truncate">Search or jump to…</span>
    </button>
  );
}

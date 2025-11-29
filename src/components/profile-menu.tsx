// src/components/profile-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const USER_KEY = "intime_user";

type ProfileMenuProps = {
  name: string;
  email: string;
};

export default function ProfileMenu({ name, email }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "G";

  function handleSignOut() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn("[ProfileMenu] Failed to clear user", e);
    }
    // Hard redirect to login so all client state resets
    window.location.href = "/login";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-slate-800 px-2 py-1 pl-1 pr-3 text-xs text-slate-100 hover:bg-slate-700 border border-slate-600"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-[11px] font-semibold text-white">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-[11px] font-semibold leading-tight">
            {name}
          </div>
          <div className="text-[10px] text-slate-300 truncate max-w-[160px]">
            {email}
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900 shadow-xl text-xs text-slate-100 z-50">
          <div className="px-3 py-2 border-b border-slate-800">
            <div className="text-[11px] font-semibold">{name}</div>
            <div className="text-[10px] text-slate-400 truncate">{email}</div>
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/80"
              onClick={() => setOpen(false)}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-300 hover:bg-rose-950/60"
            >
              <span>⏏</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

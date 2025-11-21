// src/components/profile-menu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearDevSession,
  useDevSession,
} from "@/components/dev-auth-gate";

type ProfileMenuProps = {
  name: string;
  email: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return (
    (parts[0][0]?.toUpperCase() ?? "") +
    (parts[1][0]?.toUpperCase() ?? "")
  );
}

export default function ProfileMenu({ name, email }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const session = useDevSession();

  // Prefer the dev session user if we have one, otherwise fall back to props
  const displayName = session?.user?.name || name;
  const displayEmail = session?.user?.email || email;

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = getInitials(displayName);

  function handleSignOut() {
    clearDevSession();
    setOpen(false);
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs shadow-sm hover:bg-slate-50"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
          {initials}
        </div>
        <div className="hidden flex-col sm:flex">
          <span className="text-[11px] font-medium text-slate-900">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500">
            {displayEmail}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 sm:ml-1">▾</span>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute right-0 top-[110%] w-60 rounded-xl border border-slate-200 bg-white/95 py-1 text-xs shadow-lg backdrop-blur">
          {/* Signed-in header */}
          <div className="border-b border-slate-100 px-3 py-2">
            <div className="text-[10px] font-semibold tracking-wide text-slate-500">
              SIGNED IN AS
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-slate-900">
              {displayName}
            </div>
            <div className="text-[10px] text-slate-500">
              {displayEmail}
            </div>
          </div>

          {/* Main links */}
          <div className="py-1">
            <Link
              href="/me"
              className="block px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              My profile
            </Link>

            <Link
              href="/settings"
              className="block px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            <Link
              href="/help"
              className="block px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Help &amp; support
            </Link>
          </div>

          {/* Sign out wired to dev auth */}
          <div className="border-t border-slate-100 py-1">
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-[11px] text-slate-500 hover:bg-slate-50"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

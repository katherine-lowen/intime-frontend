// src/components/user-menu.tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session) {
    // If not logged in, show nothing for now (or a "Sign in" link if you want)
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm opacity-80">{session.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="text-sm rounded border px-3 py-1 hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
}

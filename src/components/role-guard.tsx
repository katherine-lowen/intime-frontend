// src/components/role-guard.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth";
import type { ReactNode } from "react";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentRole } = useAuth();
  if (currentRole !== "admin") {
    return (
      <div className="p-8 space-y-3">
        <h2 className="text-xl font-semibold">Admins only</h2>
        <p className="text-neutral-600">
          You don’t have permission to view this page.
        </p>
        <Link href="/" className="text-blue-600 underline">
          Go back
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

export function RequireEmployee({ children }: { children: ReactNode }) {
  const { currentRole } = useAuth();
  if (currentRole !== "employee") {
    return (
      <div className="p-8 space-y-3">
        <h2 className="text-xl font-semibold">Employees only</h2>
        <p className="text-neutral-600">
          You don’t have permission to view this page.
        </p>
        <Link href="/" className="text-blue-600 underline">
          Go back
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

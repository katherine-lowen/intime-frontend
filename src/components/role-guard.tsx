"use client";
import { ReactNode } from "react";
import { useAuth } from "@/context/auth";
import Link from "next/link";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentRole } = useAuth();
  if (currentRole !== "admin") {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-2">Insufficient permissions</h2>
        <p className="text-sm text-gray-500 mb-4">This area is for Admins.</p>
        <Link className="text-intime-blue underline" href={currentRole === "employee" ? "/me" : "/"}>Go back</Link>
      </div>
    );
  }
  return <>{children}</>;
}

export function RequireEmployee({ children }: { children: ReactNode }) {
  const { currentRole } = useAuth();
  if (currentRole !== "employee") {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-2">Insufficient permissions</h2>
        <p className="text-sm text-gray-500 mb-4">This area is for Employees.</p>
        <Link className="text-intime-blue underline" href="/">Go back</Link>
      </div>
    );
  }
  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Unauthorized({
  roleLabel = "this page",
  fallbackHref = "/",
}: {
  roleLabel?: string;
  fallbackHref?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          You don&apos;t have access to this page
        </h1>
        <p className="text-sm text-slate-600">
          This area is only available to {roleLabel}. If you think this is a mistake,
          contact your admin.
        </p>
        <Button asChild className="mt-2">
          <Link href={fallbackHref}>Go back</Link>
        </Button>
      </div>
    </div>
  );
}

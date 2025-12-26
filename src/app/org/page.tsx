"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export default function OrgRootPage() {
  const router = useRouter();
  const { orgs, loading, orgSlug } = useCurrentOrg();

  const [timedOut, setTimedOut] = useState(false);

  const firstOrgSlug = useMemo(() => {
    return orgs?.[0]?.orgSlug || null;
  }, [orgs]);

  useEffect(() => {
    // hard stop: never spin forever
    const t = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;

    // If we’re already on an org route, don’t fight it.
    if (orgSlug) return;

    // If we have exactly one org, go to getting-started.
    if (orgs.length === 1 && firstOrgSlug) {
      router.replace(`/org/${firstOrgSlug}/getting-started`);
      return;
    }

    // Otherwise: stop and show UI (handled below)
  }, [loading, orgSlug, firstOrgSlug, router, orgs.length]);

  const showStuck = !loading && !orgSlug && !firstOrgSlug && timedOut && orgs.length === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      {orgs.length > 1 ? (
        <div className="w-full max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-900">Select an organization</h2>
          <p className="text-sm text-slate-600">You have access to multiple workspaces. Pick one to continue.</p>
          <div className="space-y-2">
            {orgs.map((o) => (
              <button
                key={o.orgSlug}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-100"
                onClick={() => router.replace(`/org/${o.orgSlug}/getting-started`)}
              >
                {o.orgName} <span className="text-xs text-slate-500">({o.orgSlug})</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <div className="mb-2 text-sm font-semibold text-slate-900">
            {showStuck ? "Couldn't load your organizations" : "Loading your workspace…"}
          </div>
          <div className="text-xs text-slate-500">
            {showStuck
              ? "Your org list didn't load. This is usually a backend URL/auth issue. You can retry or go to create an organization."
              : "Preparing your organization"}
          </div>

          {showStuck && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                onClick={() => router.push("/org/create")}
              >
                Create organization
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

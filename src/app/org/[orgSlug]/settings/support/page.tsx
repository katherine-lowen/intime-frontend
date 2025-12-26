"use client";

import { useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export default function SettingsSupportPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug ?? "";
  const { orgName } = useCurrentOrg();
  const pathname = usePathname();

  const copyBundle = useCallback(async () => {
    const payload = {
      orgSlug: orgSlug || null,
      orgName: orgName || null,
      path: pathname,
      requestId: null,
      timestamp: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch {
      // ignore
    }
  }, [orgName, orgSlug, pathname]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Support</h1>
        <p className="text-sm text-slate-600">
          How to get help and share diagnostics with our team.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Workspace details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-500">Org</span>
            <span className="font-semibold text-slate-900">
              {orgName || "Unknown organization"}
            </span>
            <span className="text-xs text-slate-500">Slug: {orgSlug || "n/a"}</span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">Need help?</p>
            <p className="text-xs text-slate-600">
              Copy the support bundle and share it with the Intime team. It includes org and request
              context so we can assist quickly.
            </p>
            <Button size="sm" className="mt-3" onClick={copyBundle}>
              Copy support bundle
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

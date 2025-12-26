"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivationStatus } from "@/lib/api-activation";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export default function TimeOffPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const { role, loading: orgLoading } = useCurrentOrg();
  const [policies, setPolicies] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

  useEffect(() => {
    if (!orgSlug) return;
    const slug = orgSlug;
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const status = await getActivationStatus(slug);
        const val = (status as any)?.counts?.policies ?? 0;
        if (mounted) setPolicies(typeof val === "number" ? val : 0);
      } catch {
        if (mounted) setPolicies(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [orgSlug]);

  return (
    <>
      {orgLoading && !orgSlug ? (
        <div className="flex min-h-screen items-center justify-center text-slate-500">
          Loading organization…
        </div>
      ) : null}
      {!orgLoading && !orgSlug ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Organization not found.
        </div>
      ) : null}
      {orgSlug ? (
    <main className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Time off</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Time off</h1>
          <p className="mt-1 text-sm text-slate-600">
            Policies, balances and approvals with a live calendar.
          </p>
        </div>
        {!isEmployee && (
          <Button asChild>
            <Link href={`/org/${orgSlug}/time-off/policies/new`}>New policy</Link>
          </Button>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Policies</CardTitle>
            <Badge variant="outline" className="text-[11px]">
              {loading ? "…" : policies}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            PTO, sick leave, and local holiday coverage.
          </CardContent>
        </Card>
      </div>

      {policies === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Create your first time off policy
              </p>
              <p className="text-xs text-slate-600">Add a policy to start tracking requests.</p>
            </div>
            {isEmployee ? (
              <p className="text-xs text-slate-500">Ask an admin to create a policy.</p>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/org/${orgSlug}/time-off/policies/new`}>Create policy</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm">Recent requests</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Connect your PTO backend to show upcoming time off.
          </CardContent>
        </Card>
      )}
    </main>
      ) : null}
    </>
  );
}

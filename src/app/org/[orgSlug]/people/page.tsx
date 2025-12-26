"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivationStatus } from "@/lib/api-activation";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { SeatBanner } from "@/components/billing/SeatBanner";
import { getSeatStatus, type SeatStatus } from "@/lib/api-seats";

export default function OrgPeoplePage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const { role, loading: orgLoading, isOwner, isAdmin } = useCurrentOrg();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatStatus, setSeatStatus] = useState<SeatStatus | null>(null);
  const [seatError, setSeatError] = useState<string | null>(null);

  const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

  useEffect(() => {
    if (!orgSlug) return;
    const slug = orgSlug;
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const status = await getActivationStatus(slug);
        const employees = (status as any)?.counts?.employees ?? 0;
        if (mounted) {
          setCount(typeof employees === "number" ? employees : 0);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Unable to load people");
          setCount(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [orgSlug]);

  const header = useMemo(
    () => ({
      title: "People",
      description: "Your employee directory, org chart, and people records.",
    }),
    []
  );

  useEffect(() => {
    if (!orgSlug) return;
    const slug = orgSlug;
    let cancelled = false;
    async function loadSeats() {
      try {
        const status = await getSeatStatus(slug);
        if (!cancelled) {
          setSeatStatus(status);
          setSeatError(null);
        }
      } catch (err: any) {
        if (!cancelled) setSeatError(err?.message || "Unable to load seats");
      }
    }
    void loadSeats();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const overLimit = seatStatus?.overLimit;

  if (orgLoading && !orgSlug) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading organization…
      </div>
    );
  }

  if (!orgSlug) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Organization not found.
      </div>
    );
  }

  return (
    <main className="space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">People</p>
          <h1 className="text-2xl font-semibold text-slate-900">{header.title}</h1>
          <p className="text-sm text-slate-600">{header.description}</p>
        </div>
        {!isEmployee && (
          overLimit ? (
            <div className="flex flex-col items-end gap-1 text-right">
              <Button disabled className="cursor-not-allowed opacity-60">
                Add employee
              </Button>
              <Link
                href={`/org/${orgSlug}/settings/billing`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Upgrade to add more seats
              </Link>
              {(isOwner || isAdmin) && (
                <Link
                  href={`/org/${orgSlug}/people/import`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Import CSV
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button asChild disabled={!!seatError}>
                <Link href={`/org/${orgSlug}/people/new`}>Add employee</Link>
              </Button>
              {(isOwner || isAdmin) && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/org/${orgSlug}/people/import`}>Import CSV</Link>
                </Button>
              )}
            </div>
          )
        )}
      </header>

      <SeatBanner orgSlug={orgSlug} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Employees</CardTitle>
            <Badge variant="outline" className="text-[11px]">
              {loading ? "…" : count}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Track employee profiles, docs, and reporting lines.
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      {seatError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {seatError}
        </div>
      )}

      {count === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Add your first employee</p>
              <p className="text-xs text-slate-600">
                Create an employee to start building your directory.
              </p>
            </div>
            {isEmployee ? (
              <p className="text-xs text-slate-500">Ask an admin to add employees.</p>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/org/${orgSlug}/people/new`}>Add employee</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm">Recent people</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Connect your backend people list to surface recent employees.
          </CardContent>
        </Card>
      )}
    </main>
  );
}

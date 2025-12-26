"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getSeatStatus, type SeatStatus } from "@/lib/api-seats";

export function SeatBanner({ orgSlug }: { orgSlug: string }) {
  const [status, setStatus] = useState<SeatStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getSeatStatus(orgSlug);
        if (!cancelled) {
          setStatus(res);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load seats");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  if (!status && !error) return null;

  const nearLimit =
    status && status.seatsAllowed > 0
      ? status.seatsUsed / status.seatsAllowed >= 0.8
      : false;
  const over = status?.overLimit;

  const baseClass =
    "flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-sm border";
  const style = over
    ? "border-amber-400 bg-amber-50 text-amber-900"
    : nearLimit
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`${baseClass} ${style}`}>
      <AlertTriangle className="h-4 w-4" />
      {error ? (
        <span>{error}</span>
      ) : (
        <>
          <span className="font-semibold">
            Seats: {status?.seatsUsed ?? 0} / {status?.seatsAllowed ?? 0}
          </span>
          {over ? (
            <span className="text-xs">
              You&apos;re over your seat limit. Upgrade to add more seats.
            </span>
          ) : nearLimit ? (
            <span className="text-xs">You&apos;re nearing your seat limit.</span>
          ) : null}
          <Link
            href={`/org/${orgSlug}/settings/billing`}
            className="ml-auto inline-flex items-center rounded-md border border-current px-2 py-1 text-xs font-semibold hover:underline"
          >
            Upgrade
          </Link>
        </>
      )}
    </div>
  );
}

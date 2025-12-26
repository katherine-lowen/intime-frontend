"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orgHref } from "@/lib/org-base";

type DirectReport = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  teamName?: string | null;
  pendingTimeOffCount?: number;
  pendingReviewCount?: number;
};

export default function MyTeamPage() {
  const router = useRouter();

  // ✅ params can be null — safe extract
  const params = useParams() as { orgSlug?: string } | null;
  const orgSlug = useMemo(() => params?.orgSlug ?? "", [params]);

  const { activeOrg, isLoading: authLoading } = useAuth();
  const role = activeOrg?.role;

  const [reports, setReports] = useState<DirectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "team">("name");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<DirectReport[]>("/org/my-team");
        if (!cancelled) setReports(data ?? []);
      } catch (err) {
        console.error("Failed to load my team", err);
        if (!cancelled) setError("Unable to load your team right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      if (sort === "team") {
        return (a.teamName || "").localeCompare(b.teamName || "");
      }
      const nameA = `${a.firstName ?? ""} ${a.lastName ?? ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.firstName ?? ""} ${b.lastName ?? ""}`
        .trim()
        .toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [reports, sort]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (role !== "MANAGER") {
    return <Unauthorized roleLabel="managers" fallbackHref="/org" />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {error}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        You don&apos;t have any direct reports yet.
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Team</p>
          <h1 className="text-2xl font-semibold text-slate-900">My team</h1>
          <p className="text-sm text-slate-600">
            View your direct reports and pending items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">PTO</th>
                <th className="px-6 py-3">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedReports.map((r) => {
                const fullName =
                  `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || "Unknown";

                return (
                  <tr
                    key={r.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(orgHref(`/people/${r.id}`))}
                  >
                    <td className="px-6 py-3 text-slate-900 font-medium">
                      {fullName}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{r.title ?? "—"}</td>
                    <td className="px-6 py-3 text-slate-700">
                      {r.teamName ?? "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        PTO: {r.pendingTimeOffCount ?? 0} pending
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                        Reviews: {r.pendingReviewCount ?? 0} open
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* keep orgSlug referenced so TS doesn't complain if you want it later */}
      {orgSlug ? null : null}
    </div>
  );
}

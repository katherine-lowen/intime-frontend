// src/app/teams/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

type Team = {
  id: string;
  name: string;
  department?: string | null;
  lead?: { id: string; name: string; title?: string | null } | null;
  memberCount?: number | null;
  members?: { id: string; name: string; title?: string | null }[];
};

export default function TeamsPage() {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEmployee = useMemo(() => {
    const role = (me?.role || "").toUpperCase();
    return !["OWNER", "ADMIN", "MANAGER"].includes(role);
  }, [me?.role]);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      const user = await getCurrentUser();
      if (!cancelled) setMe(user);
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (loading) setError(null);
      try {
        const data = await api.get<Team[]>(`/teams`);
        if (!cancelled) setTeams(data ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load teams.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                People · Teams
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Teams</h1>
              <p className="text-sm text-slate-600">
                Explore teams, their leads, and member counts.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <div className="col-span-4">Team</div>
              <div className="col-span-3">Lead</div>
              <div className="col-span-3">Department</div>
              <div className="col-span-2 text-right">Members</div>
            </div>
            {loading ? (
              <div className="space-y-2 px-4 py-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No teams yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm text-slate-800"
                  >
                    <div className="col-span-4 font-medium text-slate-900">
                      {team.name}
                    </div>
                    <div className="col-span-3 text-slate-700">
                      {team.lead?.name ?? "—"}
                      {team.lead?.title ? ` · ${team.lead.title}` : ""}
                    </div>
                    <div className="col-span-3 text-slate-700">
                      {team.department || "—"}
                    </div>
                    <div className="col-span-2 text-right text-slate-600">
                      {team.memberCount ?? team.members?.length ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEmployee && (
            <p className="text-xs text-slate-500">
              You have read-only access to teams.
            </p>
          )}
        </div>
      </main>
    </AuthGate>
  );
}

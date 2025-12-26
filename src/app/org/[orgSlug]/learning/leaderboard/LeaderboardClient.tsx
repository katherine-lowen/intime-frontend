"use client";

import { useEffect, useState } from "react";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { getLeaderboard } from "@/lib/learning-api";
import { Flame } from "lucide-react";

type Entry = {
  user?: string;
  score?: number;
  streak?: number;
  badges?: number;
  rank?: number;
};

export default function LeaderboardClient({ orgSlug }: { orgSlug: string }) {
  const [period, setPeriod] = useState("week");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const res = await getLeaderboard(orgSlug, period);
        if (!cancelled) setEntries(res || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load leaderboard");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, period]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Leaderboard</p>
          <h1 className="text-2xl font-semibold text-slate-900">Learning leaderboard</h1>
        </div>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="all">All time</option>
        </select>
      </div>

      {error ? <SupportErrorCard title="Leaderboard error" message={error} /> : null}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No leaderboard data yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Learner</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Streak</th>
                <th className="px-3 py-2">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-sm font-semibold text-slate-900">
                    {entry.rank ?? idx + 1}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-800">{entry.user || "Learner"}</td>
                  <td className="px-3 py-2 text-sm text-slate-800">{entry.score ?? "—"}</td>
                  <td className="px-3 py-2 text-sm text-slate-800 flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {entry.streak ?? 0}d
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-800">{entry.badges ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

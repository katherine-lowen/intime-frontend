"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { getDecisionNarrative } from "@/lib/intelligence-api";

type Theme = { id: string; title?: string | null; summary?: string | null; decisionId?: string | null };
type Moment = { id: string; title?: string | null; date?: string | null; summary?: string | null; decisionId?: string | null };
type OutcomeItem = { id: string; title?: string | null; summary?: string | null; decisionId?: string | null };

export default function DecisionNarrativeClient({ orgSlug }: { orgSlug: string }) {
  const [range, setRange] = useState<"30" | "90" | "180">("30");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [wins, setWins] = useState<OutcomeItem[]>([]);
  const [misses, setMisses] = useState<OutcomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await getDecisionNarrative(orgSlug, range);
        if (cancelled) return;
        setThemes(res?.themes ?? []);
        setMoments(res?.moments ?? []);
        setWins(res?.wins ?? []);
        setMisses(res?.misses ?? []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load narrative");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, range]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
          <h1 className="text-2xl font-semibold text-slate-900">Decision narrative</h1>
          <p className="text-sm text-slate-600">CEO-ready story of decisions and outcomes.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 180 days</option>
          </select>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/org/${orgSlug}/intelligence/decisions`}>View all decisions</Link>
          </Button>
        </div>
      </div>

      {error ? <SupportErrorCard title="Narrative" message={error} requestId={requestId} /> : null}
      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading narrative…</div>
      ) : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Themes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {themes.length === 0 ? (
            <p className="col-span-2 text-sm text-slate-600">No themes identified.</p>
          ) : (
            themes.map((theme) => (
              <div key={theme.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    Theme
                  </Badge>
                  <p className="text-sm font-semibold text-slate-900">{theme.title || "Theme"}</p>
                </div>
                {theme.summary ? <p className="text-sm text-slate-700">{theme.summary}</p> : null}
                {theme.decisionId ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/org/${orgSlug}/intelligence/decisions/${theme.decisionId}`}>View decision</Link>
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Key moments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {moments.length === 0 ? (
            <p className="text-sm text-slate-600">No key moments captured.</p>
          ) : (
            <div className="space-y-3">
              {moments.map((moment) => (
                <div key={moment.id} className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{moment.title || "Moment"}</p>
                    <span className="text-xs text-slate-500">{moment.date || "—"}</span>
                  </div>
                  {moment.summary ? <p className="text-sm text-slate-700">{moment.summary}</p> : null}
                  {moment.decisionId ? (
                    <Button size="sm" variant="link" className="px-0" asChild>
                      <Link href={`/org/${orgSlug}/intelligence/decisions/${moment.decisionId}`}>Open decision</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Wins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wins.length === 0 ? (
              <p className="text-sm text-slate-600">No wins recorded.</p>
            ) : (
              wins.map((item) => (
                <div key={item.id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-sm font-semibold text-emerald-900">{item.title || "Win"}</p>
                  {item.summary ? <p className="text-sm text-emerald-800">{item.summary}</p> : null}
                  {item.decisionId ? (
                    <Button size="sm" variant="link" className="px-0 text-emerald-800" asChild>
                      <Link href={`/org/${orgSlug}/intelligence/decisions/${item.decisionId}`}>View decision</Link>
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Misses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {misses.length === 0 ? (
              <p className="text-sm text-slate-600">No misses recorded.</p>
            ) : (
              misses.map((item) => (
                <div key={item.id} className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                  <p className="text-sm font-semibold text-rose-900">{item.title || "Miss"}</p>
                  {item.summary ? <p className="text-sm text-rose-800">{item.summary}</p> : null}
                  {item.decisionId ? (
                    <Button size="sm" variant="link" className="px-0 text-rose-800" asChild>
                      <Link href={`/org/${orgSlug}/intelligence/decisions/${item.decisionId}`}>View decision</Link>
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

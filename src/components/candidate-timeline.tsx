"use client";

import { Calendar, FileText, RefreshCw, Eye, Sparkles, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

export type CandidateEvent = {
  id: string;
  type: string;
  summary?: string | null;
  createdAt?: string | null;
};

type CandidateTimelineProps = {
  candidateId: string;
};

function getIcon(type: string) {
  switch (type) {
    case "CANDIDATE_APPLIED":
      return <FileText className="h-4 w-4 text-indigo-600" />;
    case "STAGE_CHANGED":
      return <RefreshCw className="h-4 w-4 text-blue-600" />;
    case "CANDIDATE_REVIEWED":
      return <Eye className="h-4 w-4 text-teal-600" />;
    case "NOTE_ADDED":
      return <StickyNote className="h-4 w-4 text-slate-600" />;
    case "AI_SUMMARY_GENERATED":
      return <Sparkles className="h-4 w-4 text-purple-600" />;
    default:
      return <Calendar className="h-4 w-4 text-slate-500" />;
  }
}

export default function CandidateTimeline({ candidateId }: CandidateTimelineProps) {
  const [events, setEvents] = useState<CandidateEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const org = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";
        const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

        const res = await fetch(`${api}/events?candidateId=${candidateId}`, {
          headers: { "X-Org-Id": org },
        });

        if (!res.ok) {
          setEvents([]);
          return;
        }

        const data = (await res.json()) as CandidateEvent[];
        const sorted = [...data].sort((a, b) => {
          const ta = new Date(a.createdAt ?? 0).getTime();
          const tb = new Date(b.createdAt ?? 0).getTime();
          return tb - ta;
        });

        setEvents(sorted);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Loading timeline…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Activity timeline</h2>
      <p className="mt-1 text-xs text-slate-500">
        Events related to this candidate across your ATS.
      </p>

      {events.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">No events yet.</p>
      )}

      <div className="mt-4 space-y-6 relative">
        {/* vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />

        {events.map((event) => {
          const date = event.createdAt
            ? new Date(event.createdAt).toLocaleString()
            : "Unknown time";

          return (
            <div key={event.id} className="relative flex gap-4 pl-10">
              {/* dot */}
              <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-slate-300" />

              {/* icon */}
              <div className="absolute left-6 top-0">
                {getIcon(event.type)}
              </div>

              <div className="flex flex-col">
                <div className="text-xs font-medium text-slate-800">
                  {event.summary || event.type}
                </div>
                <div className="text-[10px] text-slate-500">{date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

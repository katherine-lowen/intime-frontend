// src/app/jobs/[id]/components/CandidateCard.tsx
"use client";

import { GripVertical, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type Candidate = {
  id: string;
  name: string;
  email: string;
  avatarInitials?: string;
  source?: string;
  appliedAgo?: string;
  /** Optional – stage is usually implied by the column */
  stageId?: string;
};

type CandidateCardProps = {
  candidate: Candidate;
};

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const { name, email, avatarInitials, source, appliedAgo } = candidate;

  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm hover:-translate-y-[1px] hover:border-indigo-100 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
          {avatarInitials || name?.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-slate-900">{name}</div>
              <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                {email}
              </div>
            </div>
            <GripVertical className="mt-0.5 h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {source && (
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {source}
              </span>
            )}
            {appliedAgo && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" />
                {appliedAgo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

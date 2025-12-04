"use client";

import * as React from "react";
import { useDrop } from "react-dnd";
import CandidateCard, { type Candidate } from "./CandidateCard";

type DragItem = {
  type: "CANDIDATE";
  candidateId: string;
  fromStageId?: string;
};

type PipelineColumnProps = {
  id: string; // stage id
  title: string;
  candidates: Candidate[];
  onMoveCandidate: (candidateId: string, toStageId: string) => void;
};

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  id,
  title,
  candidates,
  onMoveCandidate,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "CANDIDATE",
    drop: (item) => {
      if (!item?.candidateId) return;
      onMoveCandidate(item.candidateId, id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Use a ref, then let react-dnd decorate it – this avoids the ref type error
  const columnRef = React.useRef<HTMLDivElement | null>(null);
  drop(columnRef);

  const isActive = isOver && canDrop;

  return (
    <div
      ref={columnRef}
      className={[
        "flex h-full min-h-[260px] flex-col rounded-2xl border bg-white/80 p-3 text-xs shadow-sm backdrop-blur",
        isActive
          ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-400/70"
          : "border-slate-200",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Column header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="text-[11px] font-medium text-slate-700">
            {title}
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {candidates.length}
        </span>
      </div>

      {/* Candidates list */}
      <div className="flex-1 space-y-2 overflow-y-auto pb-1">
        {candidates.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 text-[11px] text-slate-400">
            Drop candidates here
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;

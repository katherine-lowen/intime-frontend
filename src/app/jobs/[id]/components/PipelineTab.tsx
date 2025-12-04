"use client";

import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PipelineColumn from "./PipelineColumn";
import type { Candidate } from "./CandidateCard";

type PipelineTabProps = {
  candidates?: Candidate[];
  // allow extra props from parent (jobId, etc.) without TS complaining
  [key: string]: any;
};

type PipelineColumnState = {
  id: string;
  title: string;
  candidates: Candidate[];
};

const STAGES: { id: string; title: string }[] = [
  { id: "new", title: "New" },
  { id: "screen", title: "Screen" },
  { id: "interview", title: "Interview" },
  { id: "offer", title: "Offer" },
  { id: "hired", title: "Hired" },
];

export default function PipelineTab({ candidates = [] }: PipelineTabProps) {
  const [columns, setColumns] = React.useState<PipelineColumnState[]>(() => {
    const byStage: Record<string, Candidate[]> = {};
    for (const stage of STAGES) {
      byStage[stage.id] = [];
    }

    candidates.forEach((c) => {
      const stageId =
        c.stageId && byStage[c.stageId] ? c.stageId : STAGES[0].id;
      byStage[stageId].push(c);
    });

    return STAGES.map((stage) => ({
      id: stage.id,
      title: stage.title,
      candidates: byStage[stage.id],
    }));
  });

  const handleMoveCandidate = React.useCallback(
    (candidateId: string, toStageId: string) => {
      setColumns((prev) => {
        // Find candidate in previous columns
        let movedCandidate: Candidate | undefined;
        const withoutCandidate = prev.map((col) => {
          const remaining = col.candidates.filter((c) => {
            if (c.id === candidateId) {
              movedCandidate = c;
              return false;
            }
            return true;
          });
          return { ...col, candidates: remaining };
        });

        if (!movedCandidate) {
          return prev;
        }

        const updatedCandidate: Candidate = {
          ...movedCandidate,
          stageId: toStageId,
        };

        const next = withoutCandidate.map((col) => {
          if (col.id === toStageId) {
            return {
              ...col,
              candidates: [...col.candidates, updatedCandidate],
            };
          }
          return col;
        });

        return next;
      });
    },
    []
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4">
        {/* Small header / helper strip */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] text-slate-600">
          <span>
            Drag candidates across stages to update their pipeline status.{" "}
            <span className="text-slate-400">
              This view is optimized for high-volume roles.
            </span>
          </span>
          <span className="hidden shrink-0 text-[10px] text-slate-400 md:inline">
            Tip: Use filters and search above to narrow down large pipelines.
          </span>
        </div>

        {/* Board */}
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {columns.map((col) => (
            <PipelineColumn
              key={col.id}
              id={col.id}
              title={col.title}
              candidates={col.candidates}
              onMoveCandidate={handleMoveCandidate}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

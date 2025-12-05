interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-indigo-200 rounded-full">
      <span className="text-slate-600">Match Score</span>
      <span className="text-slate-900">{score}%</span>
    </div>
  );
}

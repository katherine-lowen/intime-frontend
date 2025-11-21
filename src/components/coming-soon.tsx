// src/components/coming-soon.tsx

type ComingSoonProps = {
  title?: string;
  description?: string;
};

export default function ComingSoon({
  title = "Coming soon",
  description = "This module is on the roadmap. In the live product, you'll be able to configure policies, workflows, and AI insights here.",
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        Preview placeholder
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="max-w-xl text-sm text-slate-600">
          {description}
        </p>
      </div>

      <ul className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
        <li className="rounded-lg bg-white px-3 py-2 shadow-sm">
          • Configure policies & rules
        </li>
        <li className="rounded-lg bg-white px-3 py-2 shadow-sm">
          • Time-aware automation
        </li>
        <li className="rounded-lg bg-white px-3 py-2 shadow-sm">
          • AI suggestions & nudges
        </li>
      </ul>
    </div>
  );
}

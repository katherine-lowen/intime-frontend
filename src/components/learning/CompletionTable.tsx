"use client";

type CompletionRow = {
  employeeName?: string | null;
  email?: string | null;
  status?: string | null;
  completedAt?: string | null;
};

export default function CompletionTable({ rows }: { rows: CompletionRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
        No completion data yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-100">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Learner</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Completed at</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50/70">
              <td className="px-3 py-2 text-sm text-slate-800">
                {row.employeeName || row.email || "Learner"}
              </td>
              <td className="px-3 py-2 text-xs uppercase text-slate-600">
                {row.status || "—"}
              </td>
              <td className="px-3 py-2 text-xs text-slate-600">
                {row.completedAt || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

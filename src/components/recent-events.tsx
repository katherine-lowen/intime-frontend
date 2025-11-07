// src/components/recent-events.tsx
"use client";

type EventItem = {
  id?: string | number;
  type?: string;
  actor?: string;
  description?: string;
  createdAt?: string | Date;
};

export function RecentEventsTable({ events = [] as EventItem[] }) {
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-600">
        No recent events yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-4 py-2 font-medium">When</th>
            <th className="px-4 py-2 font-medium">Actor</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={(e.id ?? i).toString()} className="border-t">
              <td className="px-4 py-2">
                {e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-2">{e.actor ?? "—"}</td>
              <td className="px-4 py-2">{e.type ?? "—"}</td>
              <td className="px-4 py-2">{e.description ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

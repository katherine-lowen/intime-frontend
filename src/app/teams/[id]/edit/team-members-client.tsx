// app/teams/[id]/edit/team-members-client.tsx
"use client";

import api from "@/lib/api";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";

type Person = { id: string; name: string; email?: string | null; teamId?: string | null };

export default function TeamMembersClient({
  teamId,
  people,
}: {
  teamId: string;
  people: Person[];
}) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const members = useMemo(() => people.filter(p => p.teamId === teamId), [people, teamId]);
  const nonMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = people.filter(p => p.teamId !== teamId);
    if (!q) return base;
    return base.filter(p => [p.name, p.email].some(v => (v || "").toLowerCase().includes(q)));
  }, [people, teamId, search]);

  async function add(personId: string) {
    setSavingId(personId);
    try {
      await api.patch(`/people/${personId}`, { teamId });
      location.reload();
    } finally {
      setSavingId(null);
    }
  }

  async function remove(personId: string) {
    setSavingId(personId);
    try {
      await api.patch(`/people/${personId}`, { teamId: null });
      location.reload();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Members</h2>
        {members.length === 0 ? (
          <div className="mt-2 rounded border p-3 text-sm text-gray-600">No members yet.</div>
        ) : (
          <ul className="mt-3 divide-y rounded border">
            {members.map(m => (
              <li key={m.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-medium">{m.name}</div>
                  {m.email && <div className="opacity-70">{m.email}</div>}
                </div>
                <button
                  onClick={() => remove(m.id)}
                  disabled={savingId === m.id}
                  className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                >
                  {savingId === m.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold">Add people</h3>
        <input
          className="mt-2 w-full rounded border px-3 py-2 text-sm"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="mt-3 divide-y rounded border max-h-80 overflow-auto">
          {nonMembers.map(p => (
            <li key={p.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-medium">{p.name}</div>
                {p.email && <div className="opacity-70">{p.email}</div>}
              </div>
              <button
                onClick={() => add(p.id)}
                disabled={savingId === p.id}
                className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
              >
                {savingId === p.id ? "Adding…" : "Add"}
              </button>
            </li>
          ))}
          {nonMembers.length === 0 && <li className="p-3 text-sm text-gray-600">No matches.</li>}
        </ul>
      </div>
    </div>
  );
}

// src/components/addteamform.tsx
'use client';

import { useState, type FormEvent } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'demo-org';

export default function AddTeamForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const key = typeof window !== 'undefined' ? localStorage.getItem('INTIME_KEY') || '' : '';

      const res = await fetch(`${API}/events/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Org-Id': ORG_ID,
          'X-Api-Key': key,
        },
        body: JSON.stringify({
          source: 'HR',
          type: 'team.created',
          summary: `Created team: ${name.trim()}`,
          payload: { name: name.trim() },
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      setName('');
      onDone?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to create team');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-start gap-2">
      <input
        className="w-64 border rounded px-3 py-2 text-sm"
        placeholder="Team name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button className="rounded border px-3 py-2 text-sm" disabled={saving}>
        {saving ? 'Creating…' : 'Create Team'}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}

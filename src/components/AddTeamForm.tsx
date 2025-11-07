'use client';

import { useState, FormEvent } from 'react';
import { API_URL } from '@/lib/api';
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'demo-org';

export default function AddTeamForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Org-Id': ORG_ID },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      setName('');
      onDone?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to create team');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        className="border rounded px-3 py-2"
        placeholder="Team name"
        value={name} onChange={e => setName(e.target.value)} required
      />
      <button className="rounded border px-3 py-2" disabled={saving}>
        {saving ? 'Creating…' : 'Create Team'}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}

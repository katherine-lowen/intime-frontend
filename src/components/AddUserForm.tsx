'use client';

import { useState, FormEvent } from 'react';
import { API_URL } from '@/lib/api';
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'demo-org';

export default function AddUserForm({ onDone }: { onDone?: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Org-Id': ORG_ID },
        body: JSON.stringify({ email, name }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEmail(''); setName('');
      onDone?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to invite user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
      <input
        className="border rounded px-3 py-2 min-w-[220px]"
        placeholder="email@domain.com"
        type="email" value={email} onChange={e => setEmail(e.target.value)} required
      />
      <input
        className="border rounded px-3 py-2 min-w-[180px]"
        placeholder="Name (optional)"
        value={name} onChange={e => setName(e.target.value)}
      />
      <button
        disabled={saving}
        className="rounded border px-3 py-2 disabled:opacity-50"
      >
        {saving ? 'Adding…' : 'Invite User'}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}

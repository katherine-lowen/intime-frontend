// src/components/AddUserForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import api from '@/lib/api'; // uses the default export { get, post, ... } from src/lib/api.ts

type Props = {
  onCreated?: () => void; // optional callback after a successful create
};

export default function AddUserForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/users', { name, email });
      setName('');
      setEmail('');
      onCreated?.();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <div className="text-sm font-medium">Add user</div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="w-full rounded-md border border-neutral-300 p-2"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border border-neutral-300 p-2"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add user'}
      </button>
    </form>
  );
}

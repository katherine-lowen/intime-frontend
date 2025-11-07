import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export default async function AddEventPage() {
  async function createEvent(formData: FormData) {
    'use server';
    const type = String(formData.get('type') || 'note').trim();
    const summary = String(formData.get('summary') || '').trim();
    const startsAt = String(formData.get('startsAt') || '').trim();

    if (!summary) return;

    await api.post('/events', {
      type,
      summary,
      startsAt: startsAt || undefined,
    });

    revalidatePath('/events');
  }

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Add Event</h1>
        <p className="text-sm opacity-70">Create a quick timeline event.</p>
      </header>

      <form action={createEvent} className="grid gap-3 max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm">Type</span>
          <select name="type" className="border rounded px-3 py-2">
            <option value="note">note</option>
            <option value="calendar_event">calendar_event</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Summary</span>
          <input name="summary" className="border rounded px-3 py-2" placeholder="Intro call with ACME" required />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Starts at (optional)</span>
          <input name="startsAt" type="datetime-local" className="border rounded px-3 py-2" />
        </label>

        <button className="rounded border px-4 py-2 w-fit">Create</button>
      </form>
    </main>
  );
}

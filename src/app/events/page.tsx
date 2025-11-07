import { api } from '@/lib/api';

type EventItem = {
  id: string;
  orgId: string;
  source: string;
  type: string;
  summary: string;
  startsAt?: string;
  createdAt?: string;
};

async function getEvents(): Promise<EventItem[]> {
  return api.get('/events');
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm opacity-70">Latest activity in your org.</p>
        </div>
        <a href="/add-event" className="rounded border px-3 py-2">Add Event</a>
      </header>

      <ul className="divide-y rounded border bg-white">
        {events.map(ev => (
          <li key={ev.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{ev.summary}</div>
              <div className="text-xs opacity-60">
                {ev.type} • {ev.source} • {ev.startsAt ? new Date(ev.startsAt).toLocaleString() : '—'}
              </div>
            </div>
            <span className="text-xs rounded bg-neutral-100 px-2 py-1">{ev.orgId}</span>
          </li>
        ))}
        {events.length === 0 && (
          <li className="p-4 text-sm opacity-70">No events yet.</li>
        )}
      </ul>
    </main>
  );
}

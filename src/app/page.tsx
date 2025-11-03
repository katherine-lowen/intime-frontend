"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";

type Event = {
  id: string;
  source: string;
  type: string;
  summary?: string;
  payloadJSON?: any;
  createdAt?: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await get<Event[]>("/events");
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Intime Events</h1>
          <a href="/add-event" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100">+ Add Event</a>
        </header>

        {loading && <p className="text-gray-600">Loading events…</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && events.length === 0 && <p className="text-gray-500">No events yet — add one.</p>}

        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{e.summary || e.type}</div>
                {e.createdAt && (
                  <div className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</div>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Source: <span className="font-mono">{e.source}</span> • Type: <span className="font-mono">{e.type}</span>
              </div>
              {e.payloadJSON && (
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-lg overflow-auto">
                  {JSON.stringify(e.payloadJSON, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

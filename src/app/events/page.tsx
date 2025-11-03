"use client";

import { useState } from "react";

export default function NewEventPage() {
  const [status, setStatus] = useState<string>("");

  async function createEvent() {
    setStatus("Creating…");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${base}/events/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "demo_ingest",
          payload: { note: "created from Next.js" },
        }),
      });

      const text = await res.text(); // handle JSON or text
      setStatus(`Response: ${text}`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || e}`);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>New Event</h1>
      <button
        onClick={createEvent}
        style={{ padding: "8px 12px", borderRadius: 8, background: "black", color: "white" }}
      >
        Create demo event
      </button>

      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8, marginTop: 12 }}>
        {status || "Click the button to create an event."}
      </pre>

      <p style={{ marginTop: 12 }}>
        <a href="/events">← Back to Events</a>
      </p>
    </main>
  );
}

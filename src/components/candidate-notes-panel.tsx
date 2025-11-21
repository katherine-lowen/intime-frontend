"use client";

import * as React from "react";
import api from "@/lib/api";

type CandidateNote = {
  id: string;
  text: string;
  authorName?: string | null;
  createdAt?: string;
};

type Props = {
  candidateId: string;
  initialNotes?: CandidateNote[];
};

type SaveState = "idle" | "saving" | "error";

function isMoat(note: CandidateNote) {
  return /^\[(AI-)?MOAT\]/i.test(note.text ?? "");
}

export default function CandidateNotesPanel({
  candidateId,
  initialNotes,
}: Props) {
  const [notes, setNotes] = React.useState<CandidateNote[]>(() =>
    (initialNotes ?? []).filter((n) => !isMoat(n))
  );
  const [text, setText] = React.useState("");
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [aiBusy, setAiBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setSaveState("saving");

      const newNote = await api.post<CandidateNote>(
        `/candidates/${candidateId}/notes`,
        { text: trimmed }
      );

      setNotes((prev) => [newNote, ...prev]);
      setText("");
      setSaveState("idle");
    } catch (err) {
      console.error("Failed to save note", err);
      setSaveState("error");
      setError("Could not save note. Please try again.");
    }
  }

  async function handleAiPolish(mode: "polish" | "shorten" = "polish") {
    if (!text.trim()) return;
    setAiBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-note-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { text: string };
      setText(data.text);
    } catch (err) {
      console.error("AI note assist error", err);
      setError("AI couldn’t rewrite this note. You can still save it as-is.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Candidate notes</h2>
          <p className="text-xs text-slate-400">
            Private notes visible only to your team (excluding moat insights).
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {notes.length} note{notes.length === 1 ? "" : "s"}
        </span>
      </header>

      {/* New note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Add interview notes, concerns, or follow-up items…"
          className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleAiPolish("polish")}
              disabled={aiBusy || !text.trim()}
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiBusy ? "AI polishing…" : "AI clean-up"}
            </button>
            <button
              type="button"
              onClick={() => handleAiPolish("shorten")}
              disabled={aiBusy || !text.trim()}
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Shorten
            </button>
          </div>

          <button
            type="submit"
            disabled={saveState === "saving" || !text.trim()}
            className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveState === "saving" ? "Saving…" : "Save note"}
          </button>
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}
      </form>

      {/* Existing notes */}
      {notes.length === 0 ? (
        <p className="text-xs text-slate-500">
          No notes yet for this candidate.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-md border border-slate-800 bg-slate-900/60 p-2.5"
            >
              <p className="text-xs leading-relaxed text-slate-100 whitespace-pre-wrap">
                {note.text}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>{note.authorName ?? "Internal note"}</span>
                {note.createdAt && (
                  <span>
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

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

const MOAT_PREFIX = "[MOAT] ";

function isMoat(note: CandidateNote) {
  return /^\[(AI-)?MOAT\]/i.test(note.text ?? "");
}

function stripPrefix(text: string) {
  return text.replace(/^\[(AI-)?MOAT\]\s*/i, "");
}

export default function CandidateMoatsPanel({
  candidateId,
  initialNotes,
}: Props) {
  const [moats, setMoats] = React.useState<CandidateNote[]>(() =>
    (initialNotes ?? []).filter(isMoat)
  );
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setSaving(true);

      const newNote = await api.post<CandidateNote>(
        `/candidates/${candidateId}/notes`,
        { text: `${MOAT_PREFIX}${trimmed}` }
      );

      setMoats((prev) => [newNote, ...prev]);
      setText("");
      setSaving(false);
    } catch (err) {
      console.error("Failed to save moat", err);
      setSaving(false);
      setError("Could not save moat insight. Please try again.");
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Moat insights</h2>
          <p className="text-xs text-slate-400">
            Capture the non-obvious strategic value of this candidate. These are
            your &quot;FYI, this could be huge for X&quot; notes.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {moats.length} moat{moats.length === 1 ? "" : "s"}
        </span>
      </header>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Example: They built a side project in healthcare that could be perfect for our upcoming medical vertical push…"
          className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            Think like: &quot;FYI, this person has X, which might be perfect for
            Y idea or new initiative.&quot;
          </p>
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save moat"}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </form>

      {moats.length === 0 ? (
        <p className="text-xs text-slate-500">
          No moat insights captured yet. Add one above, or use the scorecard
          moats as inspiration.
        </p>
      ) : (
        <ul className="space-y-2">
          {moats.map((note) => (
            <li
              key={note.id}
              className="rounded-md border border-slate-800 bg-slate-900/70 p-2.5"
            >
              <p className="text-xs text-slate-100 whitespace-pre-wrap">
                {stripPrefix(note.text)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>{note.authorName ?? "Recruiter moat"}</span>
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
    </section>
  );
}

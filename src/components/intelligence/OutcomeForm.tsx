"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  onSubmit: (note: string, recommendationKey?: string) => Promise<void>;
};

const RECOMMENDATION_KEYS = ["WORKFORCE", "HIRING", "PAYROLL", "LEARNING", "INTELLIGENCE"];

export function OutcomeForm({ onSubmit }: Props) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState<string>("");

  const submit = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await onSubmit(note.trim(), key || undefined);
      setNote("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Add outcome or follow-up note"
      />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="text-xs text-slate-600">Recommendation key (optional)</label>
        <select
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
        >
          <option value="">None</option>
          {RECOMMENDATION_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => void submit()} disabled={!note.trim() || loading}>
          {loading ? "Saving…" : "Add outcome"}
        </Button>
      </div>
    </div>
  );
}

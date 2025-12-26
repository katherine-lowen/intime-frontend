"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  orgSlug: string;
  onCreate: (data: { title: string; category?: string; rationale?: string }) => Promise<void>;
};

export function DecisionCreateButton({ orgSlug, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [rationale, setRationale] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = !title.trim() || loading;

  const submit = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      await onCreate({ title: title.trim(), category: category || undefined, rationale: rationale || undefined });
      setTitle("");
      setCategory("");
      setRationale("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button size="sm" onClick={() => setOpen(true)}>
        New decision
      </Button>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create decision</h3>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
              <Textarea
                placeholder="Rationale (optional)"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={3}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={() => void submit()} disabled={disabled}>
                {loading ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

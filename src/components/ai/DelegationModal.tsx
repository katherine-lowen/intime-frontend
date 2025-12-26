"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DelegationForm = {
  title: string;
  scope?: string;
  cadence?: string;
  policy?: string;
};

type Props = {
  orgSlug: string;
  open: boolean;
  onClose: () => void;
  initial?: DelegationForm & { id?: string };
  onSave: (data: DelegationForm & { id?: string }) => Promise<void>;
};

export function DelegationModal({ orgSlug, open, onClose, initial, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [scope, setScope] = useState(initial?.scope || "");
  const [cadence, setCadence] = useState(initial?.cadence || "");
  const [policy, setPolicy] = useState(initial?.policy || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setScope(initial?.scope || "");
      setCadence(initial?.cadence || "");
      setPolicy(initial?.policy || "");
    }
  }, [open, initial]);

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({
        id: initial?.id,
        title: title.trim(),
        scope: scope || undefined,
        cadence: cadence || undefined,
        policy: policy || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {initial?.id ? "Edit delegation" : "Create delegation"}
          </h3>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Scope (people, jobs, domains)" value={scope} onChange={(e) => setScope(e.target.value)} />
          <Input placeholder="Cadence (daily, weekly)" value={cadence} onChange={(e) => setCadence(e.target.value)} />
          <Textarea
            rows={4}
            placeholder="Policy / prompt"
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!title.trim() || loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

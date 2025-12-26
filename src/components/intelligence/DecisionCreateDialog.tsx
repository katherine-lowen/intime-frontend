"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDecision } from "@/lib/decisions-api";

type Defaults = {
  title?: string;
  category?: string;
  sourceType?: string;
  sourceId?: string;
  related?: string;
  recommendationKey?: string;
};

type Props = {
  orgSlug: string;
  defaults?: Defaults;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (id?: string) => void;
  hideTrigger?: boolean;
};

export function DecisionCreateDialog({
  orgSlug,
  defaults,
  open: controlledOpen,
  onOpenChange,
  onCreated,
  hideTrigger,
}: Props) {
  const router = useRouter();
  const isControlled = controlledOpen !== undefined;
  const [open, setOpen] = useState<boolean>(controlledOpen ?? false);
  const [title, setTitle] = useState(defaults?.title || "");
  const [category, setCategory] = useState(defaults?.category || "");
  const [rationale, setRationale] = useState("");
  const [sourceType, setSourceType] = useState(defaults?.sourceType || "");
  const [sourceId, setSourceId] = useState(defaults?.sourceId || "");
  const [related, setRelated] = useState(defaults?.related || "");
  const [recommendationKey, setRecommendationKey] = useState(defaults?.recommendationKey || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  useEffect(() => {
    setTitle(defaults?.title || "");
    setCategory(defaults?.category || "");
    setRationale("");
    setSourceType(defaults?.sourceType || "");
    setSourceId(defaults?.sourceId || "");
    setRelated(defaults?.related || "");
    setRecommendationKey(defaults?.recommendationKey || "");
  }, [defaults]);

  const setOpenState = (next: boolean) => {
    if (!isControlled) setOpen(next);
    onOpenChange?.(next);
  };

  const resetDefaults = () => {
    setTitle(defaults?.title || "");
    setCategory(defaults?.category || "");
    setRationale("");
    setSourceType(defaults?.sourceType || "");
    setSourceId(defaults?.sourceId || "");
    setRelated(defaults?.related || "");
    setRecommendationKey(defaults?.recommendationKey || "");
  };

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await createDecision(orgSlug, {
        title: title.trim(),
        category: category || undefined,
        rationale: rationale || undefined,
        sourceType: sourceType || undefined,
        sourceId: sourceId || undefined,
        related: related || undefined,
        recommendationKey: recommendationKey || undefined,
      });
      const id = (res as any)?.id;
      onCreated?.(id);
      if (id) router.push(`/org/${orgSlug}/intelligence/decisions/${id}`);
      setOpenState(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!hideTrigger ? (
        <Button size="sm" variant="outline" onClick={() => setOpenState(true)}>
          Create decision
        </Button>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create decision</h3>
              <button
                className="text-slate-500 hover:text-slate-700"
                onClick={() => {
                  resetDefaults();
                  setOpenState(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input
                placeholder="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Textarea
                placeholder="Rationale (optional)"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={3}
              />
              <Input
                placeholder="Source type (optional)"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              />
              <Input
                placeholder="Source id (optional)"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              />
              <Input
                placeholder="Related link/id (optional)"
                value={related}
                onChange={(e) => setRelated(e.target.value)}
              />
              <Input
                placeholder="Recommendation key (optional)"
                value={recommendationKey}
                onChange={(e) => setRecommendationKey(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetDefaults();
                  setOpenState(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={() => void submit()} disabled={!title.trim() || loading}>
                {loading ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { AccessDenied } from "@/components/support/AccessDenied";
import { useAuth } from "@/context/auth";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import { AiStudioShell } from "../AiStudioShell";
import { createMemory, deleteMemory, listMemory } from "@/lib/ai-studio-api";

type MemoryItem = {
  id: string;
  title?: string;
  content?: string;
  source?: string;
  type?: string;
};

export default function MemoryClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isScale = plan === "SCALE";
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);

  const [filter, setFilter] = useState<string>("");
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MemoryItem>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listMemory(orgSlug, filter || undefined);
        if (!cancelled) setItems((res as MemoryItem[]) || []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load memory");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isScale) void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, filter, isScale]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setRequestId(null);
    try {
      await createMemory(orgSlug, form);
      const res = await listMemory(orgSlug, filter || undefined);
      setItems((res as MemoryItem[]) || []);
      setForm({});
    } catch (err: any) {
      if (!handlePlanError(err)) {
        setError(err?.message || "Unable to save memory");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMemory(orgSlug, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      if (!handlePlanError(err)) {
        setError(err?.message || "Unable to delete memory");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    }
  };

  if (!isScale) {
    return (
      <AiStudioShell orgSlug={orgSlug}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Memory is available on Scale. Upgrade to manage AI memory.
        </div>
      </AiStudioShell>
    );
  }

  return (
    <AiStudioShell orgSlug={orgSlug}>
      {upgradeModal}
      {error ? <SupportErrorCard title="AI memory" message={error} requestId={requestId} /> : null}

      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All types</option>
          <option value="DOC">Documents</option>
          <option value="FAQ">FAQs</option>
          <option value="SNIPPET">Snippets</option>
        </select>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Add memory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Title"
            value={form.title || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Content"
            value={form.content || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            rows={3}
          />
          <Input
            placeholder="Source URL (optional)"
            value={form.source || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
          />
          <Input
            placeholder="Type (e.g., DOC, FAQ)"
            value={form.type || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          />
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save memory"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          No memory saved yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">{item.title || "Untitled"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p className="whitespace-pre-wrap">{item.content || "No content"}</p>
                {item.source ? (
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600"
                  >
                    Source
                  </a>
                ) : null}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.type || "General"}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    onClick={() => void remove(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AiStudioShell>
  );
}

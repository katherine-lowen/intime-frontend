"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { search } from "@/lib/search-api";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

type SearchResult = {
  id?: string;
  title?: string;
  subtitle?: string;
  type?: string;
  href?: string;
};

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "People", value: "PEOPLE" },
  { label: "Hiring", value: "HIRING" },
  { label: "Learning", value: "LEARNING" },
  { label: "Tasks", value: "TASKS" },
];

export function GlobalSearchCommand({
  orgSlug,
  open,
  setOpen,
}: {
  orgSlug: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setRequestId(null);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await search(orgSlug, {
          q: query.trim(),
          limit: 10,
          types: filter === "ALL" ? undefined : [filter],
        });
        setResults(Array.isArray(res) ? res : []);
      } catch (err: any) {
        setResults([]);
        setError(err?.message || "Search failed");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filter, orgSlug]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      const t = (r.type || "Other").toUpperCase();
      if (!groups[t]) groups[t] = [];
      groups[t].push(r);
    });
    return groups;
  }, [results]);

  const onSelect = (item: SearchResult) => {
    setOpen(false);
    if (item.href) {
      if (item.href.startsWith("http")) {
        window.location.href = item.href;
      } else {
        router.push(item.href);
      }
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        ref={inputRef}
        placeholder="Search people, jobs, courses…"
        value={query}
        onValueChange={setQuery}
      />
      <div className="flex items-center gap-1 px-3 py-2 text-xs">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`rounded-full px-2 py-1 ${filter === f.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <CommandList>
        {query.trim().length < 2 ? <CommandEmpty>Search people, jobs, courses…</CommandEmpty> : null}
        {loading ? <CommandEmpty>Searching…</CommandEmpty> : null}
        {!loading && results.length === 0 && query.trim().length >= 2 ? (
          <CommandEmpty>No matches</CommandEmpty>
        ) : null}
        {error ? (
          <div className="px-3 pb-3">
            <SupportErrorCard title="Search" message={error} requestId={requestId} />
          </div>
        ) : null}
        {Object.entries(grouped).map(([type, items]) => (
          <CommandGroup key={type} heading={type}>
            {items.map((item) => (
              <CommandItem
                key={item.id || item.href || item.title}
                onSelect={() => onSelect(item)}
                className="flex flex-col items-start"
              >
                <span className="text-sm font-semibold text-slate-900">{item.title || "Result"}</span>
                <span className="text-xs text-slate-600">{item.subtitle || item.href}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <CommandSeparator />
    </CommandDialog>
  );
}

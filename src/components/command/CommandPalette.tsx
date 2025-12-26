"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPalette } from "@/components/command/useCommandPalette";
import { searchPeople, searchJobs, searchCandidates, type SearchResult } from "@/lib/search";
import { seedAtsDemo, generateJobShortlist, generateCandidateSummary } from "@/lib/api-ats";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Props = {
  orgSlug: string;
  openState?: {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  onOpenPalette?: () => void;
  onClosePalette?: () => void;
};

const DEBOUNCE_MS = 250;
const MAX_RECENTS = 8;

const scoreResult = (item: SearchResult, query: string, recents: SearchResult[]) => {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();
  const subtitle = (item.subtitle || "").toLowerCase();
  let score = 0;
  if (title.startsWith(q)) score += 100;
  else if (title.includes(q)) score += 40;
  if (subtitle.includes(q)) score += 15;
  if (item.kind === "action") score += 30;
  if (item.kind === "page") score += 20;
  if (recents.find((r) => r.href === item.href)) score += 25;
  return score;
};

export function CommandPalette({ orgSlug, openState, onOpenPalette, onClosePalette }: Props) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const internal = useCommandPalette();
  const open = openState ? openState.open : internal.open;
  const setOpen = openState ? openState.setOpen : internal.setOpen;
  const openPalette = () => {
    onOpenPalette?.();
    (openState ? openState.setOpen : internal.setOpen)(true);
  };
  const closePalette = () => {
    onClosePalette?.();
    (openState ? openState.setOpen : internal.setOpen)(false);
  };
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recents, setRecents] = useState<SearchResult[]>([]);
  const [pinned, setPinned] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const jobContext = useMemo(() => {
    const match = pathname.match(/\/org\/([^/]+)\/hiring\/jobs\/([^/]+)/);
    if (match) return { org: match[1], jobId: match[2] };
    return null;
  }, [pathname]);
  const candidateContext = useMemo(() => {
    const match = pathname.match(/\/org\/([^/]+)\/hiring\/candidates\/([^/]+)/);
    if (match) return { org: match[1], candidateId: match[2] };
    return null;
  }, [pathname]);

  const staticPages: SearchResult[] = useMemo(
    () => [
      { id: "dashboard", title: "Dashboard", href: `/org/${orgSlug}/dashboard`, kind: "page" },
      { id: "people", title: "People", href: `/org/${orgSlug}/people`, kind: "page" },
      { id: "hiring", title: "Hiring", href: `/org/${orgSlug}/hiring`, kind: "page" },
      { id: "timeoff", title: "Time Off", href: `/org/${orgSlug}/time-off`, kind: "page" },
      { id: "performance", title: "Performance", href: `/org/${orgSlug}/performance`, kind: "page" },
      { id: "settings", title: "Settings", href: `/org/${orgSlug}/settings`, kind: "page" },
      { id: "billing", title: "Billing", href: `/org/${orgSlug}/settings/billing`, kind: "page" },
    ],
    [orgSlug],
  );

  const quickActions: SearchResult[] = useMemo(
    () => [
      {
        id: "create-job",
        title: "Create job",
        subtitle: "Open hiring to create a new job",
        href: `/org/${orgSlug}/hiring?createJob=1`,
        kind: "action",
      },
      {
        id: "add-candidate",
        title: "Add candidate",
        subtitle: "Go to hiring to add a candidate",
        href: `/org/${orgSlug}/hiring`,
        kind: "action",
      },
      {
        id: "seed-demo",
        title: "Seed demo data",
        subtitle: "Create a demo job and candidates",
        href: "",
        kind: "action",
      },
    ],
    [orgSlug],
  );

  useEffect(() => {
    try {
      const storedRecents = localStorage.getItem(`intime_cmdk_recents_${orgSlug}`);
      const storedPins = localStorage.getItem(`intime_cmdk_pins_${orgSlug}`);
      if (storedRecents) setRecents(JSON.parse(storedRecents));
      if (storedPins) setPinned(JSON.parse(storedPins));
    } catch {
      // ignore
    }
  }, [orgSlug]);

  useEffect(() => {
    try {
      localStorage.setItem(`intime_cmdk_recents_${orgSlug}`, JSON.stringify(recents));
    } catch {
      // ignore
    }
  }, [recents, orgSlug]);

  useEffect(() => {
    try {
      localStorage.setItem(`intime_cmdk_pins_${orgSlug}`, JSON.stringify(pinned));
    } catch {
      // ignore
    }
  }, [pinned, orgSlug]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
      if (e.key === "Escape") closePalette();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openPalette, closePalette]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
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
      try {
        setLoading(true);
        const [people, jobs, candidates] = await Promise.all([
          searchPeople(orgSlug, query),
          searchJobs(orgSlug, query),
          searchCandidates(orgSlug, query),
        ]);
        const withScores = [...people, ...jobs, ...candidates].map((item) => ({
          item,
          score: scoreResult(item, query, recents),
        }));
        const sorted = withScores.sort((a, b) => b.score - a.score).map((r) => r.item);
        setResults(sorted);
      } catch (err) {
        console.warn("[command palette] search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, orgSlug, recents]);

  const saveRecent = (item: SearchResult) => {
    setRecents((prev) => {
      const existing = prev.filter((r) => r.href !== item.href || r.title !== item.title);
      return [item, ...existing].slice(0, MAX_RECENTS);
    });
  };

  const togglePin = (item: SearchResult) => {
    setPinned((prev) => {
      const exists = prev.find((p) => p.href === item.href);
      if (exists) return prev.filter((p) => p.href !== item.href);
      return [item, ...prev].slice(0, 8);
    });
  };

  const handleSelect = async (item: SearchResult) => {
    saveRecent(item);
    if (contextActions.find((c) => c.id === item.id)) {
      const handled = await handleContextAction(item);
      if (handled) return;
    }
    if (item.kind === "action" && item.id === "seed-demo") {
      try {
        setLoading(true);
        const res = await seedAtsDemo(orgSlug, {});
        const jobId = res?.job?.id || res?.jobId;
        toast.success("Seeded demo job and candidates");
        if (jobId) router.push(`/org/${orgSlug}/hiring/jobs/${jobId}`);
      } catch (err: any) {
        toast.error(err?.message || "Unable to seed demo data");
      } finally {
        setLoading(false);
        closePalette();
      }
      return;
    }

    if (item.href) {
      router.push(item.href);
      closePalette();
    }
  };

  const contextActions: SearchResult[] = useMemo(() => {
    if (jobContext && jobContext.org === orgSlug) {
      return [
        {
          id: `ctx-add-${jobContext.jobId}`,
          title: "Add candidate to this job",
          subtitle: "Open add candidate dialog",
          href: `/org/${orgSlug}/hiring/jobs/${jobContext.jobId}?addCandidate=1`,
          kind: "action",
        },
        {
          id: `ctx-shortlist-${jobContext.jobId}`,
          title: "Generate shortlist for this job",
          subtitle: "AI shortlist for this pipeline",
          href: "",
          kind: "action",
        },
        {
          id: `ctx-pipeline-${jobContext.jobId}`,
          title: "View pipeline",
          subtitle: "Pipeline view",
          href: `/org/${orgSlug}/jobs/${jobContext.jobId}/pipeline`,
          kind: "action",
        },
      ];
    }
    if (candidateContext && candidateContext.org === orgSlug) {
      return [
        {
          id: `ctx-summary-${candidateContext.candidateId}`,
          title: "Generate AI summary",
          subtitle: "AI summary for this candidate",
          href: "",
          kind: "action",
        },
      ];
    }
    return [];
  }, [jobContext, candidateContext, orgSlug]);

  const pinLabel = (item: SearchResult) =>
    pinned.find((p) => p.href === item.href) ? "Unpin" : "Pin";

  const handleContextAction = async (item: SearchResult) => {
    if (item.id.startsWith("ctx-shortlist") && jobContext) {
      try {
        setLoading(true);
        await generateJobShortlist(orgSlug, { jobId: jobContext.jobId, force: false });
        toast.success("Shortlist generated");
        router.push(`/org/${orgSlug}/hiring/jobs/${jobContext.jobId}`);
      } catch (err: any) {
        toast.error(err?.message || "Unable to generate shortlist");
      } finally {
        setLoading(false);
        closePalette();
      }
      return true;
    }
    if (item.id.startsWith("ctx-summary") && candidateContext) {
      try {
        setLoading(true);
        await generateCandidateSummary(orgSlug, {
          candidateId: candidateContext.candidateId,
          jobId: null,
          force: false,
        });
        toast.success("AI summary requested");
      } catch (err: any) {
        toast.error(err?.message || "Unable to generate summary");
      } finally {
        setLoading(false);
        closePalette();
      }
      return true;
    }
    return false;
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search people, jobs, candidates, or actions"
    >
      <CommandInput
        ref={inputRef}
        placeholder="Search people, jobs, candidates, or actions…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </div>
        )}
        {!loading && <CommandEmpty>No results.</CommandEmpty>}

        {contextActions.length > 0 && (
          <CommandGroup heading="Context">
            {contextActions.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item)}
                disabled={item.id.includes("pipeline")}
              >
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {item.subtitle && (
                    <span className="text-xs text-slate-400">{item.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {recents.length > 0 && (
          <CommandGroup heading="Recent">
            {recents.map((item) => (
              <CommandItem key={`recent-${item.href}-${item.id}`} onSelect={() => handleSelect(item)}>
                <div className="flex flex-1 flex-col">
                  <span>{item.title}</span>
                  {item.subtitle && <span className="text-xs text-slate-400">{item.subtitle}</span>}
                </div>
                <button
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item);
                  }}
                >
                  {pinLabel(item)}
                </button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {pinned.length > 0 && (
          <CommandGroup heading="Pinned">
            {pinned.map((item) => (
              <CommandItem key={`pinned-${item.href}-${item.id}`} onSelect={() => handleSelect(item)}>
                <div className="flex flex-1 flex-col">
                  <span>{item.title}</span>
                  {item.subtitle && <span className="text-xs text-slate-400">{item.subtitle}</span>}
                </div>
                <button
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item);
                  }}
                >
                  {pinLabel(item)}
                </button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Pages">
          {staticPages.map((item) => (
            <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
              <div className="flex flex-1 flex-col">
                <span>{item.title}</span>
                {item.subtitle && <span className="text-xs text-slate-400">{item.subtitle}</span>}
              </div>
              <button
                className="text-xs text-slate-400 hover:text-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(item);
                }}
              >
                {pinLabel(item)}
              </button>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Quick actions">
          {quickActions.map((item) => (
            <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
              {item.id === "seed-demo" ? <Sparkles className="h-4 w-4 text-indigo-300" /> : null}
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.subtitle && (
                  <span className="text-xs text-slate-400">{item.subtitle}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        {(results.length > 0 || loading) && <CommandSeparator />}

        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((item) => (
              <CommandItem key={`${item.kind}-${item.id}`} onSelect={() => handleSelect(item)}>
                <div className="flex flex-1 flex-col">
                  <span>{item.title}</span>
                  {item.subtitle && (
                    <span className="text-xs text-slate-400">{item.subtitle}</span>
                  )}
                </div>
                <button
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item);
                  }}
                >
                  {pinLabel(item)}
                </button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Loader2, Briefcase, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listJobs, createJob, seedAtsDemo } from "@/lib/api-ats";
import type { Job } from "@/lib/ats-types";
import { markCompleted } from "@/lib/activation";
import { toast } from "sonner";

type Props = {
  orgSlug: string;
};

export default function HiringPage({ orgSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "" });

  useEffect(() => {
    let mounted = true;
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await listJobs(orgSlug);
        if (mounted) {
          setJobs(res);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Unable to load jobs");
          setJobs([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void fetchJobs();
    return () => {
      mounted = false;
    };
  }, [orgSlug]);

  useEffect(() => {
    const shouldOpen = searchParams?.get("createJob") === "1";
    if (shouldOpen) {
      setOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("createJob");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setCreating(true);
      const job = await createJob(orgSlug, {
        title: form.title.trim(),
        department: form.department || undefined,
        location: form.location || undefined,
      });
      setJobs((prev) => [job, ...prev]);
      await refreshJobs();
      markCompleted(orgSlug, "create_job");
      setForm({ title: "", department: "", location: "" });
      setOpen(false);
      toast.success("Job created");
    } catch (err: any) {
      toast.error(err?.message || "Unable to create job");
    } finally {
      setCreating(false);
    }
  };

  const refreshJobs = async () => {
    try {
      const res = await listJobs(orgSlug);
      setJobs(res);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Unable to refresh jobs");
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      const res = await seedAtsDemo(orgSlug, {});
      await refreshJobs();
      const jobId = res?.job?.id || res?.jobId;
      markCompleted(orgSlug, "create_job");
      markCompleted(orgSlug, "add_candidate");
      toast.success("Seeded demo job and candidates");
      if (jobId) {
        router.push(`/org/${orgSlug}/hiring/jobs/${jobId}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Unable to seed demo data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Hiring</p>
          <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
          <p className="text-sm text-slate-500">Open roles and pipeline overview.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a job</DialogTitle>
            </DialogHeader>
            <form className="space-y-3" onSubmit={handleCreate}>
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Briefcase className="h-5 w-5 text-slate-500" />
          <CardTitle className="text-base">Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-500">Loading jobs…</div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Create your first job
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Add a job and start evaluating candidates with AI.
                  </h2>
                  <p className="text-sm text-slate-600">
                    Set up a role to unlock candidate pipelines, summaries, and AI shortlists.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button className="gap-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create job
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleSeedDemo}>
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Seed demo job + candidates
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/org/${orgSlug}/hiring/jobs/${job.id}`}
                  className="block bg-white px-4 py-3 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500">
                        {[job.department, job.location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {job.status || "OPEN"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

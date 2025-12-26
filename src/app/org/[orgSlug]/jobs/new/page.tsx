"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { orgHref } from "@/lib/org-base";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export default function NewJobPage() {
  const router = useRouter();

  // ✅ params can be null in Next types — extract safely
  const params = useParams() as { orgSlug?: string } | null;
  const orgSlug = useMemo(() => params?.orgSlug ?? "", [params]);

  const { activeOrg, isLoading: authLoading } = useAuth();
  const role = activeOrg?.role;

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobsHref = orgHref("/jobs");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api.post("/org/jobs", {
        title: title.trim(),
        location: location.trim(),
        department: department.trim(),
        employmentType: employmentType.trim(),
        description,
      });
      router.push(jobsHref);
    } catch (err: any) {
      console.error("Failed to create job", err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to create job right now.";
      setError(typeof msg === "string" ? msg : "Unable to create job right now.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!role || (role !== "OWNER" && role !== "ADMIN" && role !== "MANAGER")) {
    return <Unauthorized roleLabel="owners, admins, or managers" fallbackHref="/org" />;
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">Talent</p>
        <h1 className="text-2xl font-semibold text-slate-900">Create job</h1>
        <p className="text-sm text-slate-600">Add a new role to your organization.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Senior Software Engineer"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote / SF"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="employmentType">Employment type</Label>
            <Input
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              list="employment-types"
              placeholder="Full-time"
            />
            <datalist id="employment-types">
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Role summary, responsibilities, requirements..."
            rows={6}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create job"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push(jobsHref)}>
            Cancel
          </Button>
        </div>

        {/* (Optional) keep orgSlug around if you need it later */}
        {orgSlug ? null : null}
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition, FormEvent } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type NewJobPayload = {
  title: string;
  department?: string;
  location?: string;
};

export default function AddJobDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewJobPayload>({
    title: "",
    department: "",
    location: "",
  });

  function handleChange<K extends keyof NewJobPayload>(
    key: K,
    value: NewJobPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }

    startTransition(async () => {
      try {
        await api.post("/jobs", {
          title: form.title.trim(),
          department: form.department?.trim() || undefined,
          location: form.location?.trim() || undefined,
          // backend can default status to OPEN
        });

        setForm({
          title: "",
          department: "",
          location: "",
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error("Failed to create job", err);
        setError("Something went wrong while saving. Please try again.");
      }
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90"
      >
        + Create job
      </button>

      {/* Simple modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Create job</h2>
                <p className="mt-1 text-xs text-neutral-600">
                  Open a new role. You can manage the pipeline from here or your
                  ATS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Job title
                </label>
                <input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Senior Backend Engineer"
                  className="w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Department
                </label>
                <input
                  id="department"
                  value={form.department}
                  onChange={(e) =>
                    handleChange("department", e.target.value)
                  }
                  placeholder="Engineering, Sales, Operations…"
                  className="w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Location
                </label>
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Remote, Miami, NYC…"
                  className="w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/90 disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Create job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

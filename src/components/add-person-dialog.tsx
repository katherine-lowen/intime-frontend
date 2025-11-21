"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type NewEmployeePayload = {
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  department?: string;
};

export default function AddPersonDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewEmployeePayload>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    department: "",
  });

  function handleChange<K extends keyof NewEmployeePayload>(
    key: K,
    value: NewEmployeePayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    startTransition(async () => {
      try {
        await api.post("/employees", {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email?.trim() || undefined,
          title: form.title?.trim() || undefined,
          department: form.department?.trim() || undefined,
        });

        // reset + close
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          title: "",
          department: "",
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error("Failed to create employee", err);
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
        + Add person
      </button>

      {/* Simple modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Add person</h2>
                <p className="mt-1 text-xs text-neutral-600">
                  Create a new employee record. You can edit details later.
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-xs font-medium text-neutral-700"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    required
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Jane"
                    className="w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-xs font-medium text-neutral-700"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    required
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Senior Product Manager"
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
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="Product, Engineering, Operations…"
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
                  {saving ? "Saving…" : "Save person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// src/app/employee-documents/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";

type Employee = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

type EmployeeDocumentStatus = "SENT" | "SIGNED" | "VOID";

function getEmployeeLabel(e: Employee) {
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  const main = name || e.email || "Employee";
  const suffix = e.title ? ` · ${e.title}` : "";
  return main + suffix;
}

export default function NewEmployeeDocumentPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<EmployeeDocumentStatus>("SENT");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoadingEmployees(true);
        setEmployeesError(null);

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

        const res = await fetch(`${baseUrl}/employees`, {
          headers: { "x-org-id": orgId },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load employees:", res.status, text);
          throw new Error("Failed to load employees");
        }

        const data = (await res.json()) as Employee[];
        setEmployees(data);
        if (data.length > 0) setEmployeeId(data[0].id);
      } catch (e: any) {
        setEmployeesError(e?.message || "Failed to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    }

    void loadEmployees();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee.");
      return;
    }
    if (!title.trim()) {
      setError("Document title is required.");
      return;
    }

    setSaving(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

      const res = await fetch(`${baseUrl}/employee-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify({
          employeeId,
          title: title.trim(),
          kind: kind.trim() || null,
          notes: notes.trim() || null,
          status,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create employee document failed:", res.status, text);
        throw new Error(`Create failed: ${res.status}`);
      }

      router.push("/employee-documents");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create document.");
    } finally {
      setSaving(false);
    }
  }

  const hasEmployees = employees.length > 0;

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              New document
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Log a document that&apos;s been sent or signed for an employee.
            </p>
          </div>
        </header>

        {employeesError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {employeesError}
          </div>
        )}

        {!hasEmployees && !loadingEmployees && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You don&apos;t have any employees yet. Add people to your org
            before logging documents.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Employee + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Employee
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!hasEmployees || loadingEmployees}
              >
                {!hasEmployees && <option value="">No employees</option>}
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {getEmployeeLabel(e)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as EmployeeDocumentStatus)
                }
              >
                <option value="SENT">Sent</option>
                <option value="SIGNED">Signed</option>
                <option value="VOID">Void</option>
              </select>
            </div>
          </div>

          {/* Title + Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Document title
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Offer letter, Contractor agreement, NDA..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Type (optional)
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Offer, Contract, Policy..."
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Notes (optional)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={4}
              placeholder="Links, provider (e.g. DocuSign), or any additional context."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/employee-documents")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasEmployees}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create document"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}

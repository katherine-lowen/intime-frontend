"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333").replace(/\/$/, "");
const ORG = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function NewEmployeePage() {
  const r = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const [firstName, setFirst] = React.useState("");
  const [lastName, setLast] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [department, setDept] = React.useState("");
  const [location, setLoc] = React.useState("");
  const [status, setStatus] = React.useState<"ACTIVE"|"ON_LEAVE"|"CONTRACTOR"|"ALUMNI">("ACTIVE");
  const [startDate, setStart] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: ORG,
          firstName, lastName, email,
          title: title || undefined,
          department: department || undefined,
          location: location || undefined,
          status,
          startDate: startDate || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${text}`);
      }
      // go back to list
      r.push("/employees");
      r.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create employee");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Add Employee</h1>
      <p className="mt-1 text-sm text-neutral-600">Create a real record in your database.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" value={firstName} onChange={setFirst} required />
          <Field label="Last name" value={lastName} onChange={setLast} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required className="sm:col-span-2" />
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Department" value={department} onChange={setDept} />
          <Field label="Location" value={location} onChange={setLoc} />
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm text-neutral-700">Status</label>
            <select
              className="w-full rounded-md border border-neutral-300 p-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_LEAVE">ON_LEAVE</option>
              <option value="CONTRACTOR">CONTRACTOR</option>
              <option value="ALUMNI">ALUMNI</option>
            </select>
          </div>
          <Field label="Start date" type="date" value={startDate} onChange={setStart} />
        </div>

        {err && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saving…" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  const { label, value, onChange, type = "text", required, className } = props;
  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-neutral-700">{label}</label>
      <input
        className="w-full rounded-md border border-neutral-300 p-2 text-sm"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

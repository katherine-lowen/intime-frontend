"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import {
  createRule,
  deleteRule,
  listRules,
  runRules,
  updateRule,
  listCourses,
  listPaths,
} from "@/lib/learning-api";

type Rule = {
  id: string;
  name: string;
  trigger: string;
  courseId?: string | null;
  pathId?: string | null;
  dueDays?: number | null;
  enabled?: boolean;
  role?: string | null;
  department?: string | null;
};

export default function AutomationClient({ orgSlug }: { orgSlug: string }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState<Partial<Rule>>({
    name: "",
    trigger: "ON_HIRE",
    courseId: "",
    pathId: "",
    dueDays: 7,
    enabled: true,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const [r, c, p] = await Promise.all([listRules(orgSlug), listCourses(orgSlug), listPaths(orgSlug)]);
        if (!cancelled) {
          setRules(r || []);
          setCourses(c || []);
          setPaths(p || []);
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError("Automation not enabled yet.");
        } else {
          setError(err?.message || "Unable to load rules");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const saveRule = async () => {
    try {
      const payload = {
        name: form.name,
        trigger: form.trigger,
        courseId: form.courseId,
        pathId: form.pathId,
        dueDays: form.dueDays,
        enabled: form.enabled,
        conditions: {
          role: form.role,
          department: form.department,
        },
      };
      if (editing) {
        const res = await updateRule(orgSlug, editing.id, payload);
        setRules((prev) => prev.map((r) => (r.id === editing.id ? res : r)));
      } else {
        const res = await createRule(orgSlug, payload);
        setRules((prev) => [...prev, res]);
      }
      setOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err?.message || "Unable to create rule");
    }
  };

  const toggleRule = async (rule: Rule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
    );
    try {
      await updateRule(orgSlug, rule.id, { enabled: !rule.enabled });
    } catch {
      // ignore
    }
  };

  const removeRule = async (rule: Rule) => {
    setRules((prev) => prev.filter((r) => r.id !== rule.id));
    try {
      await deleteRule(orgSlug, rule.id);
    } catch {
      // ignore
    }
  };

  const runAll = async () => {
    try {
      await runRules(orgSlug);
      alert("Rules run requested.");
    } catch (err: any) {
      setError(err?.message || "Unable to run rules");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Automation</p>
          <h1 className="text-2xl font-semibold text-slate-900">Learning automation</h1>
          <p className="text-sm text-slate-600">
            Trigger learning assignments automatically based on events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAll}>
            Run now
          </Button>
          <Button onClick={() => setOpen(true)}>Create rule</Button>
        </div>
      </div>

      {error ? (
        <SupportErrorCard title="Automation error" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading rules…
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No rules yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Trigger</th>
                <th className="px-3 py-2">Conditions</th>
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Due days</th>
                <th className="px-3 py-2">Enabled</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-sm text-slate-800">{rule.name}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{rule.trigger}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {rule.role || rule.department ? (
                      <>
                        {rule.role ? `Role: ${rule.role}` : ""}
                        {rule.role && rule.department ? " · " : ""}
                        {rule.department ? `Dept: ${rule.department}` : ""}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{rule.courseId || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{(rule as any).pathId || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{rule.dueDays ?? "—"}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!rule.enabled}
                        onChange={() => void toggleRule(rule)}
                      />
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </label>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    <button
                      className="text-indigo-600 hover:underline mr-3"
                      onClick={() => {
                        setEditing(rule);
                        setForm({
                          name: rule.name,
                          trigger: rule.trigger,
                          courseId: rule.courseId,
                          pathId: (rule as any).pathId,
                          dueDays: rule.dueDays,
                          enabled: rule.enabled,
                          role: (rule as any).role,
                          department: (rule as any).department,
                        });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-rose-600 hover:underline"
                      onClick={() => void removeRule(rule)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editing ? "Edit rule" : "Create rule"}
                </h2>
                <p className="text-sm text-slate-600">Automate course/path assignments.</p>
              </div>
              <button
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Name</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.name || ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Trigger</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.trigger}
                  onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
                >
                  <option value="ON_HIRE">On hire</option>
                  <option value="ON_ROLE_CHANGE">On role change</option>
                  <option value="ON_DEPT_CHANGE">On department change</option>
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Role condition (optional)</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={(form as any).role || ""}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Department condition (optional)</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={(form as any).department || ""}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Course</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.courseId || ""}
                  onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Path</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={(form as any).pathId || ""}
                  onChange={(e) => setForm((f) => ({ ...f, pathId: e.target.value }))}
                >
                  <option value="">Select a path (optional)</option>
                  {paths.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title || p.name || p.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Due days</span>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.dueDays ?? 7}
                  onChange={(e) => setForm((f) => ({ ...f, dueDays: Number(e.target.value) }))}
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void saveRule()} disabled={!form.name || !form.courseId}>
                Create
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

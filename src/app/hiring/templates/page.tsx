"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type Question = {
  id: string;
  label: string;
  helpText?: string | null;
  type: string;
  required: boolean;
  sortOrder: number;
};

type Template = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  questions: Question[];
  createdAt?: string;
};

const QUESTION_TYPES = [
  { value: "SHORT_TEXT", label: "Short text" },
  { value: "LONG_TEXT", label: "Long text" },
  { value: "YES_NO", label: "Yes / No" },
  { value: "SINGLE_SELECT", label: "Single select" },
  { value: "MULTI_SELECT", label: "Multi select" },
  { value: "NUMBER", label: "Number" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create template form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // simple inline “draft question” for new template
  const [draftQuestionLabel, setDraftQuestionLabel] = useState("");
  const [draftQuestionType, setDraftQuestionType] = useState("SHORT_TEXT");
  const [draftQuestionRequired, setDraftQuestionRequired] = useState(false);

  async function loadTemplates() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Template[]>("/hiring/templates");
      setTemplates(data);
    } catch (e: any) {
      console.error("Failed to load templates", e);
      setError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function handleCreateTemplate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }

    try {
      const body: any = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      // if user filled a draft question, send it along
      if (draftQuestionLabel.trim()) {
        body.questions = [
          {
            label: draftQuestionLabel.trim(),
            type: draftQuestionType,
            required: draftQuestionRequired,
          },
        ];
      }

      await api.post<Template>("/hiring/templates", body);

      // reset form
      setName("");
      setDescription("");
      setDraftQuestionLabel("");
      setDraftQuestionType("SHORT_TEXT");
      setDraftQuestionRequired(false);

      await loadTemplates();
    } catch (e: any) {
      console.error("Failed to create template", e);
      setError("Failed to create template.");
    }
  }

  return (
    <main className="space-y-6 px-6 py-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
            Hiring · Templates
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Application templates
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Set up reusable questionnaires you can attach to job postings and
            your public job board. Perfect for role-specific screens.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← Back to jobs
        </Link>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Create template card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Create a new template
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Start with a name and optional first question. You can add more
          detail later as your process evolves.
        </p>

        <form
          onSubmit={handleCreateTemplate}
          className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]"
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Template name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senior Engineer Screen"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Description (optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Internal notes for recruiters and hiring managers."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Draft question */}
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium text-slate-700">
                First question (optional)
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Question
              </label>
              <input
                value={draftQuestionLabel}
                onChange={(e) => setDraftQuestionLabel(e.target.value)}
                placeholder="e.g. Why are you interested in this role?"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Type
                </label>
                <select
                  value={draftQuestionType}
                  onChange={(e) => setDraftQuestionType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={draftQuestionRequired}
                    onChange={(e) => setDraftQuestionRequired(e.target.checked)}
                    className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Required
                </label>
              </div>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              You can always edit questions later. This just seeds the template
              with a starting screen.
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              disabled={!name.trim()}
            >
              Create template
            </button>
          </div>
        </form>
      </section>

      {/* Templates list */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Existing templates
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Attach these to jobs when opening a requisition or publishing to
              your public job board.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-4 text-sm text-slate-500">Loading templates…</p>
        ) : templates.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            No templates yet. Create your first template above.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-slate-900">
                      {tpl.name}
                    </div>
                    {!tpl.isActive && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  {tpl.description && (
                    <div className="mt-0.5 text-xs text-slate-500">
                      {tpl.description}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-slate-500">
                    {tpl.questions.length}{" "}
                    {tpl.questions.length === 1 ? "question" : "questions"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {/* Future: edit / manage template */}
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-700">
                    Edit (coming soon)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

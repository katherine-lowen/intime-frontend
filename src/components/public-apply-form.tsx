"use client";

import * as React from "react";

type Props = {
  jobId: string;
  jobTitle: string;
};

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

export default function PublicApplyForm({ jobId, jobTitle }: Props) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [source, setSource] = React.useState("");
  const [status, setStatus] = React.useState<Status>({ state: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "idle" });

    if (!name.trim() || !email.trim()) {
      setStatus({
        state: "error",
        message: "Name and email are required.",
      });
      return;
    }

    try {
      setStatus({ state: "submitting" });

      const res = await fetch("/api/public-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          name,
          email,
          phone,
          linkedinUrl,
          resumeText,
          source,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setStatus({ state: "success" });
      setName("");
      setEmail("");
      setPhone("");
      setLinkedinUrl("");
      setResumeText("");
      setSource("");
    } catch (err) {
      console.error("Apply error", err);
      setStatus({
        state: "error",
        message: "Something went wrong submitting your application.",
      });
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-slate-100">
          Apply for {jobTitle}
        </h2>
        <p className="text-xs text-slate-400">
          Share your details and a brief overview of your experience. A member
          of the team will follow up if it&apos;s a fit.
        </p>
      </header>

      {status.state === "success" ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          Thanks! Your application has been submitted.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-slate-300">
                Full name <span className="text-rose-400">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">
                Email <span className="text-rose-400">*</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-slate-300">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">
                LinkedIn profile
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-slate-300">
              How did you hear about this role?
            </label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Referral, LinkedIn, company site, etc."
              className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-slate-300">
              Brief overview of your experience
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={5}
              placeholder="You can paste your resume summary or describe your most relevant experience here."
              className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {status.state === "error" && (
            <p className="text-xs text-rose-400">{status.message}</p>
          )}

          <button
            type="submit"
            disabled={status.state === "submitting"}
            className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.state === "submitting" ? "Submitting…" : "Submit application"}
          </button>
        </form>
      )}
    </section>
  );
}

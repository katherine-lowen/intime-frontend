"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HelpPage() {
  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Help &amp; support
          </h1>
          <p className="text-sm text-slate-600">
            Resources, FAQs, and ways to reach the Intime team.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
          Early access support
        </span>
      </section>

      {/* Main grid */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Left column: contact & FAQs */}
        <div className="space-y-4">
          {/* Contact card */}
          <div className="card px-5 py-4 space-y-3">
            <div>
              <h2 className="section-title">Get in touch</h2>
              <p className="text-xs text-slate-500">
                Have a question, bug, or feature request? Reach out and we&apos;ll get back
                to you quickly.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                <div className="text-xs font-semibold text-slate-700">
                  Email support
                </div>
                <p className="text-xs text-slate-600">
                  For anything product or account related.
                </p>
                <Link
                  href="mailto:support@hireintime.ai"
                  className="mt-1 inline-flex text-xs font-medium text-indigo-600 hover:underline"
                >
                  support@hireintime.ai
                </Link>
              </div>

              <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                <div className="text-xs font-semibold text-slate-700">
                  Product feedback
                </div>
                <p className="text-xs text-slate-600">
                  Share what&apos;s working, what&apos;s confusing, and what&apos;s missing.
                </p>
                <Link
                  href="mailto:product@hireintime.ai"
                  className="mt-1 inline-flex text-xs font-medium text-indigo-600 hover:underline"
                >
                  product@hireintime.ai
                </Link>
              </div>
            </div>

            <form className="mt-2 space-y-3 text-sm">
              <div className="space-y-1">
                <label className="field-label" htmlFor="topic">
                  Topic
                </label>
                <select
                  id="topic"
                  name="topic"
                  className="field-input"
                  defaultValue="question"
                >
                  <option value="question">General question</option>
                  <option value="bug">Bug or issue</option>
                  <option value="feature">Feature request</option>
                  <option value="billing">Billing / account</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="field-label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="field-input resize-none"
                  placeholder="Tell us what you need help with..."
                />
              </div>

              <p className="text-[11px] text-slate-500">
                This form is a visual placeholder for now. During early access, please use
                the email addresses above so nothing gets lost.
              </p>

              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => {
                  alert("In early access, please email support@hireintime.ai 💌");
                }}
              >
                Submit request
              </button>
            </form>
          </div>

          {/* FAQ card */}
          <div className="card px-5 py-4 space-y-3">
            <div>
              <h2 className="section-title">Common questions</h2>
              <p className="text-xs text-slate-500">
                A few quick answers for early access customers.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-slate-800">
                  Is Intime ready for production?
                </div>
                <p className="text-xs text-slate-600">
                  Intime is in private beta. Core workflows like people, jobs, and time off
                  are stable, but we&apos;re still shipping changes quickly. We recommend
                  starting with a smaller team or sandbox environment first.
                </p>
              </div>

              <div>
                <div className="font-medium text-slate-800">
                  How do I request a feature?
                </div>
                <p className="text-xs text-slate-600">
                  Email{" "}
                  <Link
                    href="mailto:product@hireintime.ai"
                    className="text-indigo-600 hover:underline"
                  >
                    product@hireintime.ai
                  </Link>{" "}
                  with as much context as possible (team size, current tools, screenshots).
                </p>
              </div>

              <div>
                <div className="font-medium text-slate-800">
                  How do I report a bug?
                </div>
                <p className="text-xs text-slate-600">
                  If something feels broken, grab a quick screenshot and send it to{" "}
                  <Link
                    href="mailto:support@hireintime.ai"
                    className="text-indigo-600 hover:underline"
                  >
                    support@hireintime.ai
                  </Link>{" "}
                  along with what you were trying to do.
                </p>
              </div>

              <div>
                <div className="font-medium text-slate-800">
                  Do you have docs and a changelog?
                </div>
                <p className="text-xs text-slate-600">
                  Docs and a public changelog are on the roadmap. For now, we share product
                  updates directly with early access customers over email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: status + roadmap */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card px-5 py-4 space-y-3">
            <div>
              <h2 className="section-title">Status</h2>
              <p className="text-xs text-slate-500">
                A quick snapshot of how things are running.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <div>
                  <div className="font-medium text-emerald-900">All systems normal</div>
                  <p className="text-[11px] text-emerald-800">
                    API, web app, and background jobs are operating normally.
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <p className="text-[11px] text-slate-500">
                A public status page is planned for GA. During beta, we&apos;ll notify you
                directly about any major incidents.
              </p>
            </div>
          </div>

          {/* Roadmap / what to expect */}
          <div className="card px-5 py-4 space-y-3">
            <div>
              <h2 className="section-title">What to expect next</h2>
              <p className="text-xs text-slate-500">
                A few areas we&apos;re actively working on.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li>• PTO policy builder and richer time-off workflows.</li>
              <li>• Admin tools for invites, permissions, and audit logs.</li>
              <li>• Deeper AI intelligence across hiring and people analytics.</li>
              <li>• Better onboarding flows so new teams can self-serve setup.</li>
            </ul>

            <p className="text-[11px] text-slate-500">
              If there&apos;s something you need that isn&apos;t listed here, please reach
              out — early feedback shapes the roadmap.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

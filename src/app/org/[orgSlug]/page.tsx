// src/app/(app)/org/[orgSlug]/page.tsx
import Link from "next/link";

export default function OrgDashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left */}
      <div className="space-y-6">
        {/* Hero */}
        <section className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-4xl font-semibold tracking-tight text-blue-700">
                One place for people, time, and <br />
                hiring health.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your unified view of workforce patterns, hiring flow, time-based
                signals, and AI insights — continuously refreshed.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                  + Add first employee
                </button>
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                  Create a role
                </button>
              </div>
            </div>

            {/* Pills */}
            <div className="absolute right-6 top-6 hidden w-[260px] flex-col gap-2 lg:flex">
              <Pill title="Employees & teams" />
              <Pill title="Events — Time off, hiring, changes" />
              <Pill title="AI — Narrative insights" />
            </div>
          </div>

          {/* AI summary strip */}
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-slate-800">AI org summary</div>
            <div className="mt-0.5 text-xs text-slate-500">
              AI summary is temporarily unavailable.
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon="👥" label="Headcount" value="247" delta="+12" />
          <Kpi icon="🧩" label="Hiring load" value="8/12" delta="-2" />
          <Kpi icon="🎯" label="Engagement" value="4.2" delta="—" />
          <Kpi icon="📅" label="Time-off" value="23" delta="+5" />
        </section>

        {/* Workspaces */}
        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">Workspaces</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Workspace
              title="People"
              desc="Manage employees, teams, and org structure."
              href="people"
            />
            <Workspace
              title="Hiring"
              desc="Track roles, pipeline, and candidate flow."
              href="jobs"
            />
            <Workspace
              title="Time off"
              desc="Approve requests and view team calendars."
              href="time-off"
            />
            <Workspace
              title="Performance"
              desc="Cycles, reviews, and growth signals."
              href="performance"
            />
          </div>
        </section>
      </div>

      {/* Right rail */}
      <aside className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
          <button className="text-xs font-medium text-slate-500 hover:text-slate-900">
            View all
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Activity
            title="Employee Added"
            subtitle="John Smith joined Engineering"
            time="15 min ago"
          />
          <Activity
            title="Time Off Approved"
            subtitle="Sarah Chen · Dec 20–27"
            time="15 min ago"
          />
          <Activity
            title="Role Opened"
            subtitle="Senior Product Designer"
            time="1 hour ago"
          />
          <Activity
            title="Profile Updated"
            subtitle="Michael Torres changed teams"
            time="3 hours ago"
          />
        </div>
      </aside>
    </div>
  );
}

function Pill({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm">
      {title}
    </div>
  );
}

function Kpi(props: { icon: string; label: string; value: string; delta: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-lg">
          {props.icon}
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
          {props.delta}
        </span>
      </div>
      <div className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
        {props.value}
      </div>
      <div className="mt-2 text-xs font-medium text-slate-600">{props.label}</div>
    </div>
  );
}

function Workspace(props: { title: string; desc: string; href: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{props.title}</div>
      <div className="mt-1 text-xs text-slate-500">{props.desc}</div>
      <Link
        href={props.href}
        className="mt-3 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Open workspace →
      </Link>
    </div>
  );
}

function Activity(props: { title: string; subtitle: string; time: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-900">{props.title}</div>
          <div className="mt-1 text-xs text-slate-500">{props.subtitle}</div>
        </div>
        <div className="text-[11px] text-slate-400">{props.time}</div>
      </div>
      <div className="mt-2 text-[11px] font-medium text-slate-400">via System</div>
    </div>
  );
}

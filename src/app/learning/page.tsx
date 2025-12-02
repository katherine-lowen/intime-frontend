// src/app/learning/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Course = {
  id: string;
  title: string;
  category?: string | null;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  estMinutes?: number | null;
  activeLearners?: number | null;
  completionRate?: number | null; // 0–1
};

type LearningPath = {
  id: string;
  name: string;
  audience: string; // e.g. "New hires", "People managers"
  useCase: string; // e.g. "Onboarding", "Promotion", "Compliance"
  courseCount: number;
  avgDurationMinutes: number;
};

type AssignmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

type Assignment = {
  id: string;
  learnerName: string;
  learnerRole?: string | null;
  pathName?: string | null;
  courseTitle: string;
  dueDate?: string | null; // ISO
  status: AssignmentStatus;
};

// ---- Fetch helpers with safe fallbacks ----

async function fetchCourses(): Promise<Course[]> {
  try {
    // Backend can return richer course objects; we only use a subset
    const raw = await api.get<any[]>("/learning/courses");
    return raw.map((c) => ({
      id: String(c.id),
      title: c.title ?? "Untitled course",
      category: c.category ?? null,
      difficulty: null, // can wire to c.level later if you want
      estMinutes: c.estimatedMinutes ?? null,
      activeLearners: c.activeLearners ?? null,
      completionRate: c.completionRate ?? null,
    }));
  } catch (err) {
    console.error("Failed to load /learning/courses, using fallback", err);
    // Fallback sample data so UI looks alive
    return [
      {
        id: "c1",
        title: "Intime 101: Working Here",
        category: "Onboarding",
        difficulty: "BEGINNER",
        estMinutes: 25,
        activeLearners: 6,
        completionRate: 0.92,
      },
      {
        id: "c2",
        title: "Security & Data Protection",
        category: "Compliance",
        difficulty: "INTERMEDIATE",
        estMinutes: 40,
        activeLearners: 4,
        completionRate: 0.78,
      },
      {
        id: "c3",
        title: "Manager Essentials: 1:1s & Feedback",
        category: "Managers",
        difficulty: "INTERMEDIATE",
        estMinutes: 35,
        activeLearners: 2,
        completionRate: 0.63,
      },
    ];
  }
}

async function fetchLearningPaths(): Promise<LearningPath[]> {
  try {
    const raw = await api.get<any[]>("/learning/paths");
    return raw.map((p) => {
      const items = Array.isArray(p.items) ? p.items : [];
      const durations = items
        .map((it: any) => it.course?.estimatedMinutes as number | undefined)
        .filter((n): n is number => typeof n === "number" && n > 0);

      const totalMinutes =
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0)
          : p.avgDurationMinutes ?? 0;

      return {
        id: String(p.id),
        name: p.name ?? "Untitled path",
        audience: p.audience ?? "All employees",
        useCase: p.useCase ?? "Onboarding",
        courseCount: items.length || p.courseCount || 0,
        avgDurationMinutes: totalMinutes,
      };
    });
  } catch (err) {
    console.error("Failed to load /learning/paths, using fallback", err);
    return [
      {
        id: "lp1",
        name: "New hire onboarding",
        audience: "All new employees",
        useCase: "Onboarding",
        courseCount: 4,
        avgDurationMinutes: 90,
      },
      {
        id: "lp2",
        name: "First-time people managers",
        audience: "New managers",
        useCase: "Promotion",
        courseCount: 5,
        avgDurationMinutes: 120,
      },
      {
        id: "lp3",
        name: "Annual compliance & security",
        audience: "Entire org",
        useCase: "Compliance",
        courseCount: 3,
        avgDurationMinutes: 75,
      },
    ];
  }
}

async function fetchAssignments(): Promise<Assignment[]> {
  try {
    const raw = await api.get<any[]>("/learning/assignments");
    const now = new Date();

    return raw.map((a) => {
      const employee = a.employee || {};
      const course = a.course || {};
      const path = a.path || {};
      const dueIso: string | undefined = a.dueDate ?? a.due_at;

      // Map backend status → UI status
      let status: AssignmentStatus = "NOT_STARTED";
      if (a.status === "IN_PROGRESS") status = "IN_PROGRESS";
      else if (a.status === "COMPLETED") status = "COMPLETED";

      // Overdue if not completed and due date in the past
      if (
        dueIso &&
        status !== "COMPLETED" &&
        !Number.isNaN(new Date(dueIso).getTime()) &&
        new Date(dueIso) < now
      ) {
        status = "OVERDUE";
      }

      return {
        id: String(a.id),
        learnerName:
          `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
          "Unnamed employee",
        learnerRole: employee.title ?? employee.role ?? null,
        pathName: path.name ?? null,
        courseTitle: course.title ?? a.courseTitle ?? "Untitled course",
        dueDate: dueIso ?? null,
        status,
      };
    });
  } catch (err) {
    console.error("Failed to load /learning/assignments, using fallback", err);
    return [
      {
        id: "a1",
        learnerName: "Steven Meoni",
        learnerRole: "CTO",
        pathName: "Annual compliance & security",
        courseTitle: "Security & Data Protection",
        dueDate: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "IN_PROGRESS",
      },
      {
        id: "a2",
        learnerName: "Test Person",
        learnerRole: "Marketing",
        pathName: "New hire onboarding",
        courseTitle: "Intime 101: Working Here",
        dueDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "NOT_STARTED",
      },
      {
        id: "a3",
        learnerName: "Another Employee",
        learnerRole: "People Ops",
        pathName: "First-time people managers",
        courseTitle: "Manager Essentials: 1:1s & Feedback",
        dueDate: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "OVERDUE",
      },
    ];
  }
}

// ---- Helpers ----

function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function summarizeLearning(
  courses: Course[],
  assignments: Assignment[],
): {
  totalCourses: number;
  activeLearners: number;
  avgCompletionRate: number; // 0–1
  inProgress: number;
  overdue: number;
} {
  const totalCourses = courses.length;

  const activeLearners = courses.reduce(
    (sum, c) => sum + (c.activeLearners ?? 0),
    0,
  );

  const completionRates = courses
    .map((c) => c.completionRate)
    .filter((v): v is number => typeof v === "number");

  const avgCompletionRate =
    completionRates.length > 0
      ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
      : 0;

  let inProgress = 0;
  let overdue = 0;
  for (const a of assignments) {
    if (a.status === "IN_PROGRESS") inProgress += 1;
    if (a.status === "OVERDUE") overdue += 1;
  }

  return { totalCourses, activeLearners, avgCompletionRate, inProgress, overdue };
}

// ---- Page ----

export default async function LearningPage() {
  const [courses, paths, assignments] = await Promise.all([
    fetchCourses(),
    fetchLearningPaths(),
    fetchAssignments(),
  ]);

  const summary = summarizeLearning(courses, assignments);

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Learning
            </h1>
            <p className="text-sm text-slate-600">
              Connect employee development to your HR workflows. Create learning
              paths, assign training, and track completion — all inside Intime.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              HRIS · Learning
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              Early preview
            </span>
          </div>
        </section>

        {/* TOP ROW: SUMMARY STATS */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Active courses
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {summary.totalCourses}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Structured, trackable content
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Active learners
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {summary.activeLearners}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              People currently assigned or in progress
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Avg completion rate
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {Math.round(summary.avgCompletionRate * 100)}%
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Across all active courses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              In progress · Overdue
            </div>
            <div className="mt-1 flex items-baseline gap-2 text-slate-900">
              <span className="text-2xl font-semibold">
                {summary.inProgress}
              </span>
              <span className="text-xs text-amber-600">
                {summary.overdue} overdue
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Use this as your weekly follow-up list
            </p>
          </div>
        </section>

        {/* SECOND ROW: LEARNING PATHS + ASSIGNMENTS */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.7fr)]">
          {/* Learning paths */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Learning paths by lifecycle
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Bundle courses into paths for onboarding, promotions, and
                  recurring training.
                </p>
              </div>
              <Link
                href="#"
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-50 hover:bg-slate-800"
              >
                New learning path
              </Link>
            </div>

            {paths.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                No learning paths yet. Start by grouping a few courses into a
                &quot;New hire onboarding&quot; path.
              </p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs text-slate-700">
                {paths.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {p.name}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>{p.audience}</span>
                        <span className="h-0.5 w-0.5 rounded-full bg-slate-400" />
                        <span>{p.useCase}</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div>
                        {p.courseCount} course
                        {p.courseCount === 1 ? "" : "s"}
                      </div>
                      <div>
                        ~{Math.round(p.avgDurationMinutes / 5) * 5} min total
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              <div className="font-medium text-slate-700">
                Where this is headed
              </div>
              <p className="mt-1">
                Intime will eventually let you auto-assign paths based on role
                changes, locations, or performance outcomes — similar to how
                Remote Learning plugs into their HRIS.
              </p>
            </div>
          </div>

          {/* Assignments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Assignments &amp; follow-ups
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Who&apos;s been assigned what, and where you might need to
                  nudge.
                </p>
              </div>
            </div>

            {assignments.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                No assignments yet. Once you assign courses or paths to
                employees, they will appear here grouped by status.
              </p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full border-collapse text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        Learner
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Path / Course
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Due
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {assignments.map((a) => {
                      const statusLabel = a.status
                        .toLowerCase()
                        .replace("_", " ");
                      let statusClasses =
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium";
                      if (a.status === "COMPLETED") {
                        statusClasses +=
                          " bg-emerald-50 text-emerald-700 border border-emerald-100";
                      } else if (a.status === "OVERDUE") {
                        statusClasses +=
                          " bg-rose-50 text-rose-700 border border-rose-100";
                      } else if (a.status === "IN_PROGRESS") {
                        statusClasses +=
                          " bg-amber-50 text-amber-700 border border-amber-100";
                      } else {
                        statusClasses +=
                          " bg-slate-50 text-slate-700 border border-slate-100";
                      }

                      return (
                        <tr key={a.id}>
                          <td className="max-w-[160px] px-3 py-2 align-top">
                            <div className="truncate text-xs font-medium text-slate-900">
                              {a.learnerName}
                            </div>
                            {a.learnerRole && (
                              <div className="truncate text-[11px] text-slate-500">
                                {a.learnerRole}
                              </div>
                            )}
                          </td>
                          <td className="max-w-[220px] px-3 py-2 align-top">
                            <div className="truncate text-xs font-medium text-slate-900">
                              {a.courseTitle}
                            </div>
                            {a.pathName && (
                              <div className="truncate text-[11px] text-slate-500">
                                {a.pathName}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top text-[11px] text-slate-500">
                            {formatShortDate(a.dueDate)}
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span className={statusClasses}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* THIRD ROW: COURSE CATALOG */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Course catalog
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your internal library of training content. Start scrappy with a
                few essential courses, expand over time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                Import SCORM / video (future)
              </button>
              <button className="rounded-full border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-50 hover:bg-slate-800">
                New course
              </button>
            </div>
          </div>

          {courses.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              No courses yet. Create your first course for onboarding or
              security training — these usually have the highest impact.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {c.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    {c.category && <span>{c.category}</span>}
                    {c.difficulty && (
                      <>
                        <span className="h-0.5 w-0.5 rounded-full bg-slate-400" />
                        <span>
                          {c.difficulty.toLowerCase().replace("_", " ")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      ~{c.estMinutes ?? 30} min •{" "}
                      {c.activeLearners ?? 0} learner
                      {c.activeLearners === 1 ? "" : "s"}
                    </span>
                    <span>
                      {c.completionRate != null
                        ? `${Math.round(c.completionRate * 100)}% completed`
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}

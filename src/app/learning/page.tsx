// src/app/learning/page.tsx
"use client";

import React from "react";
import { BookOpen, Users, TrendingUp, Clock, Plus } from "lucide-react";
import { AuthGate } from "@/components/dev-auth-gate";

import { StatCard } from "./components/stat-card";
import { LearningPathItem } from "./components/learning-path-item";
import { AssignmentRow } from "./components/assignment-row";
import { CourseCard } from "./components/course-card";

export default function LearningPage() {
  const learningPaths = [
    {
      id: 1,
      name: "New hire onboarding",
      audience: "All new employees",
      useCase: "Onboarding",
      courseCount: 4,
      duration: "~90 min",
    },
    {
      id: 2,
      name: "Manager essentials",
      audience: "Team leads & managers",
      useCase: "Role transition",
      courseCount: 6,
      duration: "~180 min",
    },
    {
      id: 3,
      name: "Annual compliance",
      audience: "All employees",
      useCase: "Recurring training",
      courseCount: 3,
      duration: "~45 min",
    },
    {
      id: 4,
      name: "Security fundamentals",
      audience: "Engineering & Product",
      useCase: "Department-specific",
      courseCount: 5,
      duration: "~120 min",
    },
  ];

  const assignments = [
    {
      id: 1,
      learnerName: "Sarah Chen",
      learnerAvatar: "SC",
      pathOrCourse: "New hire onboarding",
      due: "Dec 15, 2025",
      status: "in-progress" as const,
    },
    {
      id: 2,
      learnerName: "Michael Torres",
      learnerAvatar: "MT",
      pathOrCourse: "Annual compliance",
      due: "Dec 8, 2025",
      status: "overdue" as const,
    },
    {
      id: 3,
      learnerName: "Emma Wilson",
      learnerAvatar: "EW",
      pathOrCourse: "Manager essentials",
      due: "Dec 20, 2025",
      status: "completed" as const,
    },
    {
      id: 4,
      learnerName: "James Park",
      learnerAvatar: "JP",
      pathOrCourse: "Security fundamentals",
      due: "Dec 18, 2025",
      status: "in-progress" as const,
    },
    {
      id: 5,
      learnerName: "Lisa Anderson",
      learnerAvatar: "LA",
      pathOrCourse: "Annual compliance",
      due: "Dec 5, 2025",
      status: "overdue" as const,
    },
    {
      id: 6,
      learnerName: "David Kim",
      learnerAvatar: "DK",
      pathOrCourse: "New hire onboarding",
      due: "Dec 22, 2025",
      status: "not-started" as const,
    },
  ];

  const courses = [
    {
      id: 1,
      title: "Security & Data Protection",
      category: "Security",
      difficulty: "Beginner" as const,
      duration: "~35 min",
      learnerCount: 6,
      completionRate: 78,
    },
    {
      id: 2,
      title: "Effective 1:1 Conversations",
      category: "Management",
      difficulty: "Intermediate" as const,
      duration: "~50 min",
      learnerCount: 12,
      completionRate: 92,
    },
    {
      id: 3,
      title: "Product Strategy Basics",
      category: "Product",
      difficulty: "Intermediate" as const,
      duration: "~65 min",
      learnerCount: 8,
      completionRate: 88,
    },
    {
      id: 4,
      title: "Compliance Training 2025",
      category: "Compliance",
      difficulty: "Beginner" as const,
      duration: "~25 min",
      learnerCount: 37,
      completionRate: 84,
    },
    {
      id: 5,
      title: "Advanced SQL for Analysts",
      category: "Technical",
      difficulty: "Advanced" as const,
      duration: "~120 min",
      learnerCount: 4,
      completionRate: 75,
    },
    {
      id: 6,
      title: "Feedback & Performance Reviews",
      category: "Management",
      difficulty: "Intermediate" as const,
      duration: "~45 min",
      learnerCount: 11,
      completionRate: 95,
    },
  ];

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        {/* Sticky header bar */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1400px] px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">People</span>
                  <span className="text-xs text-slate-300">→</span>
                  <span className="text-xs text-slate-900">Learning</span>
                </div>
                <h1 className="mb-2 text-slate-900">Learning</h1>
                <p className="max-w-2xl text-sm text-slate-600">
                  Connect employee development to your HR workflows. Create
                  learning paths, assign training, and track completion — all
                  inside Intime.
                </p>
              </div>
              <div className="ml-6 flex items-start gap-2">
                <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">
                  HRIS · Learning
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                  Early preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-[1400px] px-8 py-8">
          {/* Row 1: Summary metrics */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <StatCard
              title="Active courses"
              value="12"
              caption="Structured, trackable content"
              icon={BookOpen}
            />
            <StatCard
              title="Active learners"
              value="37"
              caption="People currently assigned or in progress"
              icon={Users}
            />
            <StatCard
              title="Avg completion rate"
              value="84%"
              caption="Across all active courses"
              icon={TrendingUp}
              progressBar={84}
            />
            <StatCard
              title="In progress · Overdue"
              value="10"
              caption="Use this as your weekly follow-up list"
              icon={Clock}
              badge={{ text: "3 overdue", variant: "danger" }}
            />
          </div>

          {/* Row 2: Two main panels */}
          <div className="mb-8 grid grid-cols-12 gap-6">
            {/* Left panel: Learning paths */}
            <div className="col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-1 flex items-start justify-between">
                  <h2 className="text-lg text-slate-900">
                    Learning paths by lifecycle
                  </h2>
                  <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-indigo-700">
                    <Plus className="h-3.5 w-3.5" />
                    New learning path
                  </button>
                </div>
                <p className="mb-6 text-xs text-slate-600">
                  Bundle courses into paths for onboarding, promotions, and
                  recurring training.
                </p>

                <div className="mb-6 space-y-3">
                  {learningPaths.map((path) => (
                    <LearningPathItem key={path.id} {...path} />
                  ))}
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="mt-1.5 h-1 w-1 rounded-full bg-indigo-600" />
                    <span className="text-xs text-indigo-900">
                      Where this is headed
                    </span>
                  </div>
                  <p className="ml-3 text-xs leading-relaxed text-indigo-800">
                    Soon, you&apos;ll auto-assign paths based on role, location,
                    or performance triggers. Think &quot;promote to manager →
                    assign Manager essentials&quot; without manual work.
                  </p>
                </div>
              </div>
            </div>

            {/* Right panel: Assignments */}
            <div className="col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-lg text-slate-900">
                  Assignments &amp; follow-ups
                </h2>
                <p className="mb-6 text-xs text-slate-600">
                  Who&apos;s been assigned what, and where you might need to
                  nudge.
                </p>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                    <div className="col-span-4 text-xs uppercase tracking-wide text-slate-700">
                      Learner
                    </div>
                    <div className="col-span-4 text-xs uppercase tracking-wide text-slate-700">
                      Path / Course
                    </div>
                    <div className="col-span-2 text-xs uppercase tracking-wide text-slate-700">
                      Due
                    </div>
                    <div className="col-span-2 text-xs uppercase tracking-wide text-slate-700">
                      Status
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {assignments.map((assignment) => (
                      <AssignmentRow key={assignment.id} {...assignment} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Course catalog */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="mb-1 text-lg text-slate-900">Course catalog</h2>
                <p className="text-xs text-slate-600">
                  Your internal library of training content. Start scrappy with
                  a few essential courses, expand over time.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {courses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

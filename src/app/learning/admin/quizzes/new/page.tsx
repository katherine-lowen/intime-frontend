// src/app/learning/admin/quizzes/new/page.tsx
"use client";

import { AuthGate } from "@/components/dev-auth-gate";
import { QuizBuilder } from "../components/QuizBuilder";

export default function NewQuizPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>People</span>
              <span className="text-slate-300">→</span>
              <span>Learning</span>
              <span className="text-slate-300">→</span>
              <span>Admin</span>
              <span className="text-slate-300">→</span>
              <span>New quiz</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Create quiz
            </h1>
            <p className="text-sm text-slate-600">
              Define passing score, questions, and answer feedback.
            </p>
          </div>

          <QuizBuilder mode="create" />
        </div>
      </div>
    </AuthGate>
  );
}

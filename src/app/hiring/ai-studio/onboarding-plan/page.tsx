// src/app/hiring/ai-studio/onboarding-plan/page.tsx
import AiOnboardingPlan from "@/components/ai-onboarding-plan";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

// Demo employee context for standalone AI Studio usage
const demoEmployee = {
  id: "demo-employee",
  firstName: "Taylor",
  lastName: "Rivers",
  title: "Senior Product Manager",
  department: "Product",
  // add anything else your component might read; TS can be relaxed with `as any`
};

export default function OnboardingPlanToolPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI onboarding plan
        </h1>
        <p className="text-sm text-slate-600">
          Generate a personalized 30–60–90 day plan using role, manager, and team
          context. This view uses a demo employee when opened from AI Studio.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* `as any` keeps TS happy if the component expects a stricter Employee type */}
        <AiOnboardingPlan employee={demoEmployee as any} />
      </section>
    </main>
  );
}

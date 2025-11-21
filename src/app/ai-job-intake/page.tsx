import AIJobIntakeForm from "@/components/ai-job-intake-form";
import { AuthGate } from "@/components/dev-auth-gate";

export default function AIJobIntakePage() {
  return (
    <main className="p-6">
      <AIJobIntakeForm />
    </main>
  );
}

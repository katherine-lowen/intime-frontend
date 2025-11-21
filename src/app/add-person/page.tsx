// src/app/add-person/page.tsx
import AddPersonForm from "@/components/add-person-form";
import { AuthGate } from "@/components/dev-auth-gate";

export default function AddPersonPage() {
  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add person
          </h1>
          <p className="text-sm text-slate-600">
            Create a new employee record in Intime.
          </p>
        </div>
      </header>

      <section className="max-w-xl rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
        <AddPersonForm />
      </section>
    </main>
  );
}
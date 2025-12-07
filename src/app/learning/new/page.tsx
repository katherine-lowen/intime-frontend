"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export default function NewLearningPathPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lifecycleStage, setLifecycleStage] = useState("onboarding");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/learning/paths", {
        name,
        description,
        lifecycleStage,
        isActive,
      });

      router.push("/learning");
    } catch (err: any) {
      console.error("Failed to create learning path", err);
      setError("Couldn't create learning path. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 py-10 px-6">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm border border-slate-200">
          
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            New Learning Path
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Create a structured path for onboarding, compliance, or role-specific training.
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Path Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Path Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g., New Hire Onboarding"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Describe what employees will learn in this path"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Lifecycle Stage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lifecycle Stage
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={lifecycleStage}
                onChange={(e) => setLifecycleStage(e.target.value)}
              >
                <option value="onboarding">Onboarding</option>
                <option value="compliance">Compliance</option>
                <option value="promotion">Promotion</option>
                <option value="development">Development</option>
              </select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                id="isActiveToggle"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActiveToggle" className="text-sm text-slate-700">
                Mark learning path as active
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 transition"
            >
              {loading ? "Creating..." : "Create Learning Path"}
            </button>
          </form>
        </div>
      </div>
    </AuthGate>
  );
}

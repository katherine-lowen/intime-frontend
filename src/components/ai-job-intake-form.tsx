"use client";

import { useState } from "react";

export default function AIJobIntakeForm() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateNotes, setCandidateNotes] = useState("");
  const [seniority, setSeniority] = useState("");
  const [team, setTeam] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-job-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          candidateNotes,
          seniority,
          team,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">AI Job Intake</h1>
      <p className="opacity-70">
        Paste a job description and notes — Intime will turn it into structured
        insights automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Seniority Level (e.g. Mid-Senior)"
          value={seniority}
          onChange={(e) => setSeniority(e.target.value)}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Team (e.g. Marketing)"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <textarea
          className="w-full border rounded p-2 h-40"
          placeholder="Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <textarea
          className="w-full border rounded p-2 h-32"
          placeholder="Recruiter Notes"
          value={candidateNotes}
          onChange={(e) => setCandidateNotes(e.target.value)}
        />

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate Job Intake"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="border rounded p-4 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

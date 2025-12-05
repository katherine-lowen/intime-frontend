// src/app/hiring/ai-studio/resume-match/page.tsx
"use client";

import { useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import { Hero } from "./components/Hero";
import { InputCard } from "./components/InputCard";
import { ResultCard } from "./components/ResultCard";

interface MatchResult {
  score: number;
  summary: string;
  nextStep: string;
  strengths: string[];
  risks: string[];
}

export default function AiResumeMatchPage() {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChooseJob = () => {
    // TODO: Replace this mock with the "current job" from your ATS context
    const mockJob =
      "Senior Full-Stack Engineer\n\nWe're seeking an experienced Full-Stack Engineer to join our growing team. You'll be responsible for building scalable web applications using React, Node.js, and PostgreSQL.\n\nRequirements:\n- 6+ years of full-stack development experience\n- Expert knowledge of React, Node.js, TypeScript\n- Experience with microservices architecture\n- Strong understanding of cloud infrastructure (AWS/GCP)\n- Experience with Kubernetes and container orchestration\n- Leadership experience managing small engineering teams\n- Excellent communication skills";

    setSelectedJob(mockJob);
  };

  const handleSubmit = async (data: {
    jobDescription: string;
    candidateNotes: string;
    resume: File | null;
  }) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("jobDescription", data.jobDescription || "");
      if (data.candidateNotes) {
        fd.append("candidateNotes", data.candidateNotes);
      }
      if (data.resume) {
        fd.append("file", data.resume);
      }

      const res = await fetch("/api/ai-resume-match", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || `Request failed: ${res.status}`);
      }

      const strengths: string[] = Array.isArray(json.topStrengths)
        ? json.topStrengths
        : [];
      const risks: string[] = Array.isArray(json.risksOrGaps)
        ? json.risksOrGaps
        : [];

      const mappedResult: MatchResult = {
        score: json.matchScore ?? 0,
        summary: json.summary ?? "",
        nextStep: json.suggestedNextStep ?? "",
        strengths,
        risks,
      };

      setResult(mappedResult);
    } catch (err: any) {
      console.error("[AI Resume Match] error:", err);
      setError(err?.message || "Failed to generate resume match");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-[1100px] px-6 py-10 md:px-8 md:py-16">
          <Hero onChooseJob={handleChooseJob} />

          <div className="mt-8">
            <InputCard
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              selectedJob={selectedJob}
              onUseSelectedJob={handleChooseJob}
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-8">
              <ResultCard result={result} hasSelectedJob={!!selectedJob} />
            </div>
          )}
        </main>
      </div>
    </AuthGate>
  );
}

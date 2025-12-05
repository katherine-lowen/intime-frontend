// src/app/hiring/ai-studio/job-description/page.tsx
"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Copy,
  Download,
  RotateCcw,
  Briefcase,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { AuthGate } from "@/components/dev-auth-gate";

import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { SuggestionsPanel } from "./components/SuggestionsPanel";
import { ActionBar } from "./components/ActionBar";
import { GeneratedPlaceholder } from "./components/GeneratedPlaceholder";

export const dynamic = "force-dynamic";

type JDState = "empty" | "loading" | "generated";

export default function JobDescriptionToolPage() {
  const router = useRouter();

  const [state, setState] = useState<JDState>("empty");
  const [roleInput, setRoleInput] = useState("");
  const [seniority, setSeniority] = useState("");
  const [department, setDepartment] = useState("");
  const [generatedJD, setGeneratedJD] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleGenerate = () => {
    if (!roleInput.trim() && !seniority && !department) return;

    setState("loading");

    // 🔮 Simulated AI generation for now – replace with real API later.
    setTimeout(() => {
      setGeneratedJD({
        title: `${seniority || "Mid-Level"} ${
          department || "Engineering"
        } Position`,
        summary:
          "We are seeking a talented professional to join our growing team. This role will be critical in driving our mission forward and collaborating with cross-functional teams to deliver exceptional results.",
        responsibilities: [
          "Lead and execute strategic initiatives aligned with company objectives",
          "Collaborate with cross-functional teams to deliver high-quality outcomes",
          "Mentor junior team members and contribute to team growth",
          "Drive continuous improvement in processes and methodologies",
          "Communicate effectively with stakeholders at all levels",
        ],
        requirements: [
          "5+ years of relevant professional experience",
          "Strong analytical and problem-solving skills",
          "Excellent communication and collaboration abilities",
          "Proven track record of delivering results in fast-paced environments",
          "Bachelor's degree in a relevant field or equivalent experience",
        ],
        niceToHave: [
          "Experience in a high-growth startup environment",
          "Advanced degree or relevant certifications",
          "Previous leadership or mentorship experience",
          "Familiarity with modern tools and methodologies",
        ],
        teamStructure:
          "Reports to Head of Department. Works closely with Product, Design, and Operations teams.",
      });
      setState("generated");
    }, 1800);
  };

  const buildFullDescription = () => {
    if (!generatedJD) return "";

    return `${generatedJD.title}

${generatedJD.summary}

Responsibilities:
${generatedJD.responsibilities.map((r: string) => `• ${r}`).join("\n")}

Requirements:
${generatedJD.requirements.map((r: string) => `• ${r}`).join("\n")}

Nice-to-Have:
${generatedJD.niceToHave.map((r: string) => `• ${r}`).join("\n")}

${generatedJD.teamStructure}`;
  };

  const handleStartOver = () => {
    setState("empty");
    setRoleInput("");
    setSeniority("");
    setDepartment("");
    setGeneratedJD(null);
  };

  const handleCopy = () => {
    if (!generatedJD) return;
    const text = buildFullDescription();
    if (!text) return;
    void navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    // placeholder – wire to real PDF generator later
    alert("PDF download functionality would be implemented here.");
  };

  const handleCreateJob = () => {
    if (!generatedJD) return;

    const description = buildFullDescription();

    // Store draft JD so /jobs/new can prefill from localStorage
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "intime_ai_jd_draft",
        JSON.stringify({
          title: generatedJD.title,
          description,
          seniority,
          department,
          source: "ai-jd",
        }),
      );
    }

    // Navigate to the existing job creation flow
    const params = new URLSearchParams({ source: "ai-jd" });
    if (generatedJD.title) {
      params.set("title", generatedJD.title);
    }

    router.push(`/jobs/new?${params.toString()}`);
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-slate-200/80 bg-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

          <div className="mx-auto max-w-[1400px] px-8 py-10">
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <span className="text-xs tracking-wide">Hiring</span>
              <span className="text-xs">→</span>
              <span className="text-xs tracking-wide">AI Studio</span>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                AI Job Description
              </h1>
            </div>

            <p className="max-w-2xl text-sm leading-snug text-slate-600">
              Generate a polished JD from a role summary, intake notes, or an
              existing posting. Refine it, then create a job directly from the
              AI-generated description.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-[1400px] px-8 py-12">
          <div className="flex gap-8">
            {/* Main workspace */}
            <div className="flex-1 space-y-8">
              {/* Input card */}
              <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
                <InputPanel
                  roleInput={roleInput}
                  setRoleInput={setRoleInput}
                  seniority={seniority}
                  setSeniority={setSeniority}
                  department={department}
                  setDepartment={setDepartment}
                  onGenerate={handleGenerate}
                  isLoading={state === "loading"}
                  isFocused={isFocused}
                  setIsFocused={setIsFocused}
                />
              </div>

              {/* Output / states */}
              {state === "empty" && <GeneratedPlaceholder />}

              {state === "loading" && (
                <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
                  <div className="px-10 py-12">
                    <div className="mb-8 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Sparkles className="h-4 w-4 animate-pulse text-white" />
                      </div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Your AI-Generated Job Description
                      </h2>
                    </div>

                    <div className="max-w-3xl space-y-6">
                      <div className="h-10 animate-shimmer rounded-xl bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                      <div className="space-y-3">
                        <div className="h-4 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                        <div className="h-4 w-11/12 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                        <div className="h-4 w-10/12 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                      </div>
                      <div className="pt-4">
                        <div className="mb-4 h-6 w-1/3 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                        <div className="space-y-3">
                          <div className="h-4 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                          <div className="h-4 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                          <div className="h-4 w-9/12 animate-shimmer rounded-lg bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 bg-[length:200%_100%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state === "generated" && generatedJD && (
                <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
                  <OutputPanel generatedJD={generatedJD} />
                  <ActionBar
                    onCreateJob={handleCreateJob}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onStartOver={handleStartOver}
                  />
                </div>
              )}
            </div>

            {/* Right-hand suggestions */}
            <SuggestionsPanel
              onSelectPrompt={(prompt) => {
                setRoleInput(prompt);
                setIsFocused(true);
              }}
            />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

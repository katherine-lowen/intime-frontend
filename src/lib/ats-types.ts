// src/lib/ats-types.ts

export type ApplicationStage =
  | "APPLIED"
  | "SCREEN"
  | "ONSITE"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export type Job = {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  linkedInUrl?: string | null;
  jobId?: string | null;
  applicationId?: string | null;
  stage?: ApplicationStage;
  notes?: string | null;
};

export type AiCandidateSummary = {
  candidateId: string;
  jobId: string | null;
  fitScore: number;
  highlights: string[];
  risks: string[];
  interviewQuestions: string[];
  rationale: string;
};

export type AiShortlistItem = {
  candidateId: string;
  applicationId?: string;
  name: string;
  email?: string | null;
  fitScore: number;
  topReasons: string[];
  nextAction: "SCREEN" | "INTERVIEW" | "REJECT";
};

export type AiJobShortlist = {
  jobId: string;
  generatedAt: string;
  items: AiShortlistItem[];
};

export type Application = {
  id: string;
  jobId: string;
  candidateId: string;
  stage: ApplicationStage;
  notes?: string | null;
};

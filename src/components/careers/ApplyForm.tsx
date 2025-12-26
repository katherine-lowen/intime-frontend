"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ApplicationQuestion = {
  id: string;
  label: string;
  type: "TEXT" | "LONG_TEXT";
  required?: boolean;
};

type ApplyResponse = {
  candidatePublicId: string;
  jobTitle: string;
  status: string;
};

type ApplyFormProps = {
  orgSlug: string;
  publicId: string;
  questions?: ApplicationQuestion[];
  accentColor: string;
  jobTitle: string;
  orgName?: string;
  headerImage?: string;
};

export function ApplyForm({
  orgSlug,
  publicId,
  jobTitle,
  accentColor,
  orgName,
  headerImage,
  questions = [],
}: ApplyFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = accentColor || "#0ea5e9";

  const requiredQuestions = useMemo(
    () => questions.filter((q) => q.required),
    [questions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      setError("Please provide your name and email.");
      return;
    }
    if (!resumeFile) {
      setError("Resume is required.");
      return;
    }
    for (const q of requiredQuestions) {
      if (!answers[q.id]?.trim()) {
        setError("Please answer all required questions.");
        return;
      }
    }

    const answersJson = JSON.stringify(
      questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? "",
      }))
    );

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("email", email.trim());
    if (phone.trim()) formData.append("phone", phone.trim());
    if (location.trim()) formData.append("location", location.trim());
    if (linkedInUrl.trim()) formData.append("linkedInUrl", linkedInUrl.trim());
    if (websiteUrl.trim()) formData.append("websiteUrl", websiteUrl.trim());
    if (coverLetterText.trim()) formData.append("coverLetterText", coverLetterText.trim());
    if (answersJson) formData.append("answersJson", answersJson);
    if (resumeFile) formData.append("resumeFile", resumeFile);
    if (coverLetterFile) formData.append("coverLetterFile", coverLetterFile);
    if (orgSlug) formData.append("orgSlug", orgSlug);

    try {
      setSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/careers/jobs/${publicId}/apply`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Application failed");
      }

      const payload = (await res.json()) as ApplyResponse;
      if (payload?.candidatePublicId) {
        router.push(`/careers/status/${payload.candidatePublicId}`);
      } else {
        setError("Application submitted, but we could not load your status page.");
      }
    } catch (err: any) {
      console.error("Apply failed", err);
      setError(
        err?.message ||
          "Something went wrong while submitting your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <p
          className="text-xs uppercase tracking-wide"
          style={{ color: accent }}
        >
          {orgName ? `Careers at ${orgName}` : "Careers"}
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Apply for {jobTitle}
        </h2>
        {headerImage && (
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <img
              src={headerImage}
              alt={jobTitle}
              className="h-32 w-full object-cover"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Basic information</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full name *
            </label>
            <Input
              className="mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email *
            </label>
            <Input
              className="mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input
              className="mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Location</label>
            <Input
              className="mt-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>
      </div>

      {/* Professional links */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Professional links</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">LinkedIn</label>
            <Input
              className="mt-1"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/you"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Website / portfolio</label>
            <Input
              className="mt-1"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>

      {/* Cover letter */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Cover letter</h3>
        <Textarea
          className="mt-1"
          value={coverLetterText}
          onChange={(e) => setCoverLetterText(e.target.value)}
          placeholder="Optional – use this to add context beyond your resume."
          rows={4}
        />
      </div>

      {/* Attachments */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Resume & attachments</h3>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Resume (PDF, DOC, DOCX) *
          </label>
          <Input
            className="mt-1"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-slate-500">
            We’ll parse your resume with AI to help the hiring team, but it never auto-rejects you.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Cover letter (optional)
          </label>
          <Input
            className="mt-1"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCoverLetterFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-slate-500">
            Optional – use this to add context beyond your resume.
          </p>
        </div>
      </div>

      {/* Additional questions */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Additional questions</h3>
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  {q.label} {q.required ? "*" : ""}
                </label>
                {q.type === "LONG_TEXT" ? (
                  <Textarea
                    className="mt-1"
                    rows={4}
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    required={q.required}
                  />
                ) : (
                  <Input
                    className="mt-1"
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    required={q.required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-stretch gap-3 pt-2 md:flex-row md:justify-end">
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit application"}
        </Button>
      </div>
    </form>
  );
}

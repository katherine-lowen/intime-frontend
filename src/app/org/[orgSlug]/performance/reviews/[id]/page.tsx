"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { toast } from "sonner";
import { PlanGate } from "@/components/PlanGate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { aiDraftPerformanceReview } from "@/lib/api-ai-performance";

type Question = {
  id: string;
  prompt: string;
  type: "text" | "rating" | "multiple_choice";
  options?: string[];
};

type ReviewPayload = {
  id: string;
  title: string;
  status: string;
  questions: Question[];
  answers?: Record<string, string>;
  reviewerId?: string;
};

export default function ReviewDetailPage() {
  const params = useParams<{ orgSlug: string; id: string }>();
  const orgSlug = params?.orgSlug ?? "demo-org";
  const reviewId = params?.id ?? "";
  const router = useRouter();
  const { activeOrg, isLoading: authLoading, userId } = useAuth();
  const [review, setReview] = useState<ReviewPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [managerSummary, setManagerSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiTone, setAiTone] = useState("supportive");
  const [aiLength, setAiLength] = useState("medium");
  const [aiFocus, setAiFocus] = useState("balanced");
  const [aiBullets, setAiBullets] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement | null>(null);

  const isEmployee = (activeOrg?.role || "").toUpperCase() === "EMPLOYEE";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!reviewId) return;
      try {
        setLoading(true);
        const res = await api.get<ReviewPayload>(`/performance/reviews/${reviewId}`);
        if (!cancelled) {
          setReview(res ?? null);
          setAnswers(res?.answers || {});
          setManagerSummary((res?.answers || {})["managerSummary"] || "");
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load review");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  const canAccess = useMemo(() => {
    if (!review) return true;
    if (!userId) return false;
    return review.reviewerId ? review.reviewerId === userId || !isEmployee : true;
  }, [review, userId, isEmployee]);
  const canDraft = useMemo(() => {
    if (!review || !userId) return false;
    return review.reviewerId === userId || !isEmployee;
  }, [review, userId, isEmployee]);

  const handleAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!reviewId) return;
    try {
      setSubmitting(true);
      const payloadAnswers = managerSummary
        ? { ...answers, managerSummary }
        : answers;
      await api.post(`/performance/reviews/${reviewId}/submit`, { answers: payloadAnswers });
      toast.success("Review submitted");
      setReview((prev) =>
        prev ? { ...prev, status: "SUBMITTED", answers: payloadAnswers } : prev
      );
      router.push(`/org/${orgSlug}/performance/my-reviews`);
    } catch (err: any) {
      toast.error(err?.message || "Unable to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraft = async () => {
    if (!reviewId || !canDraft) return;
    try {
      setAiLoading(true);
      const draft = await aiDraftPerformanceReview(orgSlug, reviewId, {
        tone: aiTone,
        length: aiLength,
        focus: aiFocus,
        bullets: aiBullets,
      });
      setAiDraft(draft || fallbackDraft(review?.title));
    } catch (err: any) {
      toast.error("AI draft unavailable — showing a template instead.");
      setAiDraft(fallbackDraft(review?.title));
    } finally {
      setAiLoading(false);
      setTimeout(() => {
        draftRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const handleCopy = async () => {
    if (!aiDraft) return;
    try {
      await navigator.clipboard.writeText(aiDraft);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Unable to copy right now");
    }
  };

  const handleInsertSummary = () => {
    if (!aiDraft) return;
    setManagerSummary(aiDraft);
    toast.success("Inserted into summary");
    draftRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!review || error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {error || "Review not found"}
      </div>
    );
  }

  if (!canAccess) {
    return <Unauthorized roleLabel="assigned reviewers" fallbackHref={`/org/${orgSlug}/performance/my-reviews`} />;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <button
        onClick={() => router.push(`/org/${orgSlug}/performance/my-reviews`)}
        className="text-xs font-semibold text-indigo-700 hover:underline"
        type="button"
      >
        ← Back to My Reviews
      </button>

      <Card className="border-slate-200">
        <CardHeader>
          <p className="text-xs uppercase tracking-wide text-slate-500">Performance · Review</p>
          <CardTitle className="text-xl">{review.title}</CardTitle>
          <p className="text-xs text-slate-500">Status: {review.status || "IN_PROGRESS"}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {canDraft && (
            <PlanGate required="GROWTH" feature="AI draft feedback">
            <Card className="border-slate-200 bg-slate-50">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">AI Draft</p>
                  <CardTitle className="text-base">Draft feedback</CardTitle>
                  <p className="text-xs text-slate-600">
                    Generate a starting point for this review. Edit before submitting.
                  </p>
                </div>
                <Button size="sm" onClick={handleDraft} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Draft feedback
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Tone</Label>
                    <Select value={aiTone} onValueChange={setAiTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supportive">Supportive</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Length</Label>
                    <Select value={aiLength} onValueChange={setAiLength}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Focus</Label>
                    <Select value={aiFocus} onValueChange={setAiFocus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strengths">Strengths</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Checkbox
                      id="bullets"
                      checked={aiBullets}
                      onCheckedChange={(val) => setAiBullets(!!val)}
                    />
                    <Label htmlFor="bullets" className="text-xs text-slate-600">
                      Bullets
                    </Label>
                  </div>
                </div>

                {aiDraft && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">Draft</Label>
                    <Textarea
                      ref={draftRef}
                      rows={5}
                      value={aiDraft}
                      onChange={(e) => setAiDraft(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                      >
                        Copy to clipboard
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleInsertSummary}
                        className="gap-2"
                      >
                        Insert into summary
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </PlanGate>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-800">Manager summary</Label>
            <Textarea
              value={managerSummary}
              onChange={(e) => setManagerSummary(e.target.value)}
              placeholder="Add a short summary for this review"
            />
          </div>

          {review.questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              value={answers[q.id] || ""}
              onChange={(val) => handleAnswer(q.id, val)}
            />
          ))}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit review
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function QuestionItem({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (val: string) => void;
}) {
  if (question.type === "text") {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">{question.prompt}</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your response"
        />
      </div>
    );
  }

  if (question.type === "rating") {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">{question.prompt}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant={value === String(n) ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onChange(String(n))}
              type="button"
            >
              {n}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "multiple_choice") {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">{question.prompt}</Label>
        <RadioGroup value={value} onValueChange={onChange}>
          {(question.options || []).map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem value={opt} id={`${question.id}-${opt}`} />
              <Label htmlFor={`${question.id}-${opt}`} className="text-sm text-slate-700">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  return null;
}

function fallbackDraft(title?: string) {
  return [
    `Summary for ${title || "this review"}:`,
    "",
    "Strengths:",
    "- Consistently delivers quality work on time.",
    "- Collaborates well with cross-functional teams.",
    "",
    "Growth areas:",
    "- Prioritize communication of blockers earlier.",
    "- Deepen expertise in the core domain.",
    "",
    "Next steps:",
    "- Align on goals for the next cycle and checkpoints.",
  ].join("\n");
}

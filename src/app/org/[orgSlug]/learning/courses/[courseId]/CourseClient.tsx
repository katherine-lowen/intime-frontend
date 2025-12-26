"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  MoveUp,
  MoveDown,
  ClipboardList,
  Video,
} from "lucide-react";
import { attestCompletion, createLesson, getCourse, getProgress, updateLesson } from "@/lib/learning-api";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import InviteToCourseModal from "@/components/learning/InviteToCourseModal";
import LearningLessonList from "@/components/learning/LearningLessonList";
import CompletionTable from "@/components/learning/CompletionTable";
import VideoLessonPlayer from "@/components/learning/VideoLessonPlayer";
import {
  listAssignments,
  getAdminAnalytics,
  getAdvancedReporting,
  exportScorm,
  previewReminders,
  runReminders,
  listReleases,
  publishCourse,
  reassignLatest,
  getTranscript,
  uploadTranscript,
  aiQuizFromVideo,
} from "@/lib/learning-api";
import { useAuth } from "@/context/auth";
import { quizFromLesson } from "@/lib/learning-api";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";

type LessonType = "ARTICLE" | "VIDEO" | "QUIZ" | string;

type Lesson = {
  id: string;
  title?: string | null;
  type?: LessonType;
  content?: string | null;
  order?: number | null;
  videoAsset?: {
    videoAssetId?: string | null;
    streamUid?: string | null;
    status?: string | null;
  } | null;
};

type Course = {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  attestationRequired?: boolean;
  attestationStatus?: string | null;
  attestedAt?: string | null;
  lessons?: Lesson[];
};

type ProgressRow = {
  employeeName?: string | null;
  email?: string | null;
  status?: string | null;
  completedAt?: string | null;
  progressPercent?: number | null;
};

export default function CourseClient({
  orgSlug,
  courseId,
}: {
  orgSlug: string;
  courseId: string;
}) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("ARTICLE");
  const [lessonContent, setLessonContent] = useState("");
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const canAdmin = role === "OWNER" || role === "ADMIN" || role === "MANAGER" || role === "";
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const [quizPreview, setQuizPreview] = useState<any[] | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState<any | null>(null);
  const [advancedError, setAdvancedError] = useState<string | null>(null);
  const [scormVersion, setScormVersion] = useState("SCORM_1_2");
  const [attestationStatus, setAttestationStatus] = useState<string | null>(null);
  const [attesting, setAttesting] = useState(false);
  const [attestError, setAttestError] = useState<string | null>(null);
  const [attestRequestId, setAttestRequestId] = useState<string | null>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [versionNotes, setVersionNotes] = useState("");
  const [reassignOpen, setReassignOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [reassignScope, setReassignScope] = useState("COMPLETED_ONLY");
  const [reassignDue, setReassignDue] = useState<number | "">("");
  const [reassignMessage, setReassignMessage] = useState("");
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [transcriptLessonId, setTranscriptLessonId] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptStatus, setTranscriptStatus] = useState<string | null>(null);
  const [videoQuizLessonId, setVideoQuizLessonId] = useState<string | null>(null);
  const [videoQuizCount, setVideoQuizCount] = useState(8);
  const [videoQuizPreview, setVideoQuizPreview] = useState<any[] | null>(null);
  const [videoQuizPersist, setVideoQuizPersist] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setRequestId(null);
      try {
        const res: any = await getCourse(orgSlug, courseId);
        if (cancelled) return;
        const normalized: Course = {
          ...res,
          lessons: Array.isArray(res?.lessons) ? res.lessons : [],
        };
        setCourse(normalized);
        setAttestationStatus(
          (normalized as any)?.attestationStatus ||
            ((normalized as any)?.attestedAt ? "ATTESTED" : null)
        );
        setLessons(normalized.lessons ?? []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load course");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    }

    async function loadProgress() {
      try {
        const res: any = await getProgress(orgSlug, courseId);
        const list =
          Array.isArray(res) || Array.isArray(res?.data)
            ? (res as any[])
            : Array.isArray(res?.progress)
              ? res.progress
              : [];
        setProgress(list as ProgressRow[]);
      } catch (err: any) {
        // ignore missing progress endpoint
      }
    }

    async function loadAssignmentsFallback() {
      try {
        const list = await listAssignments(orgSlug);
        if (list?.length) {
          const mapped = list
            .filter((a) => a.courseId === courseId)
            .map((a) => ({
              employeeName: a.assigneeName || a.email,
              email: a.email,
              status: a.status,
              completedAt: a.completedAt,
              progressPercent: a.progressPercent,
            }));
          if (mapped.length && !progress.length) setProgress(mapped);
        }
      } catch {
        // ignore
      }
    }

    async function loadAnalytics() {
      try {
        const res = await getAdminAnalytics(orgSlug, courseId);
        setAnalytics(res);
        if (plan === "SCALE") {
          try {
            const adv = await getAdvancedReporting(orgSlug, courseId);
            setAdvanced(adv);
          } catch (err: any) {
            if (err?.response?.status === 404) {
              setAdvancedError("Advanced reporting not enabled yet.");
            } else {
              setAdvancedError(err?.message || "Unable to load advanced reporting");
            }
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setAnalyticsError("Analytics not enabled yet.");
        } else {
          setAnalyticsError(err?.message || "Unable to load analytics");
        }
      }
    }

    async function loadReleases() {
      try {
        const rel = await listReleases(orgSlug, courseId);
        setReleases(Array.isArray(rel) ? rel : []);
      } catch {
        // ignore if not available
      }
    }

    void load();
    void loadProgress();
    void loadAssignmentsFallback();
    void loadAnalytics();
    void loadReleases();
    return () => {
      cancelled = true;
    };
  }, [courseId, orgSlug]);

  const sortedLessons = useMemo(
    () =>
      [...lessons].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title?.localeCompare(b.title || "") || 0
      ),
    [lessons]
  );

  const handleAddLesson = async () => {
    setAdding(true);
    setError(null);
    setRequestId(null);
    try {
      const res: any = await createLesson(orgSlug, courseId, {
        title: lessonTitle,
        type: lessonType,
        content: lessonContent,
      });
      const newLesson = res as Lesson;
      setLessons((prev) => [...prev, newLesson]);
      setLessonTitle("");
      setLessonContent("");
      setLessonType("ARTICLE");
    } catch (err: any) {
      setError(err?.message || "Unable to add lesson");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setAdding(false);
    }
  };

  const handleReorder = async (lessonId: string, direction: "up" | "down") => {
    const idx = sortedLessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedLessons.length) return;

    const newOrder = [...sortedLessons];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setLessons(newOrder);

    try {
      await updateLesson(orgSlug, lessonId, {
        position: swapIdx,
      });
    } catch {
      // ignore reorder failure
    }
  };

  const lessonRows = sortedLessons.map((lesson, i) => ({
    ...lesson,
    order: i,
  }));

  const handleGenerateQuiz = async (lessonId: string) => {
    setError(null);
    setRequestId(null);
    setQuizPreview(null);
    try {
      const res = await quizFromLesson(orgSlug, lessonId, 5);
      const questions = Array.isArray(res?.questions)
        ? res.questions
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setQuizPreview(questions);
    } catch (err: any) {
      setError(err?.message || "Unable to generate quiz");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    }
  };

  const handleAttest = async () => {
    setAttesting(true);
    setAttestError(null);
    setAttestRequestId(null);
    try {
      await attestCompletion(orgSlug, courseId);
      setAttestationStatus("ATTESTED");
    } catch (err: any) {
      setAttestError(err?.message || "Unable to attest");
      setAttestRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setAttesting(false);
    }
  };

  if (!course && !error) {
    return (
      <div className="p-6 text-sm text-slate-600">Loading course…</div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <SupportErrorCard
          title="Unable to load course"
          message={error}
          requestId={requestId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Course</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {course?.title || "Course"}
          </h1>
          <p className="text-sm text-slate-600">{course?.description || "No description yet."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/org/${orgSlug}/learning/courses/${courseId}/learn`}>
              Start / Continue
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            Invite to course
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">Lessons</h2>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLessonType("ARTICLE")}>
                Add lesson
              </Button>
            </div>

            <LearningLessonList
              lessons={lessonRows}
              onReorder={handleReorder}
              renderActions={(lesson) =>
                <>
                  {lesson.type === "VIDEO" ? (
                    <div className="flex items-center gap-2">
                      <VideoLessonPlayer
                        orgSlug={orgSlug}
                        lesson={lesson}
                        mode="admin"
                        onUpdated={(updated) =>
                          setLessons((prev) =>
                            prev.map((l) => (l.id === lesson.id ? { ...l, ...updated } : l))
                          )
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (plan !== "SCALE") {
                            setShowScaleModal(true);
                            return;
                          }
                          setTranscriptLessonId(lesson.id);
                        }}
                      >
                        Transcript
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (plan !== "SCALE") {
                            setShowScaleModal(true);
                            return;
                          }
                          setVideoQuizLessonId(lesson.id);
                        }}
                      >
                        Generate quiz from video
                      </Button>
                    </div>
                  ) : null}
                  {lesson.type === "ARTICLE" ? (
                    <button
                      className="text-[11px] font-medium text-indigo-600 hover:underline"
                      onClick={() =>
                        plan === "SCALE"
                          ? void handleGenerateQuiz(lesson.id)
                          : setShowScaleModal(true)
                      }
                    >
                      Generate quiz
                    </button>
                  ) : null}
                </>
              }
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Title</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Lesson title"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Type</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as LessonType)}
                >
                  <option value="ARTICLE">Article</option>
                  <option value="VIDEO">Video</option>
                  <option value="QUIZ">Quiz</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-700 sm:col-span-3">
                <span className="font-medium">Content (optional)</span>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Markdown or plain text"
                  rows={3}
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <Button onClick={handleAddLesson} disabled={adding || !lessonTitle}>
                {adding ? "Adding…" : "Add lesson"}
              </Button>
            </div>
          </section>

          {course?.attestationRequired ? (
            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-sm font-semibold text-slate-900">Manager attestation</h2>
                  <p className="text-xs text-slate-600">
                    This course requires a manager/admin to attest completion.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                  {attestationStatus || "Pending"}
                </span>
              </div>
              {attestError ? (
                <div className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {attestError}
                  {attestRequestId ? <span className="ml-2 text-[11px] text-rose-600">Request ID: {attestRequestId}</span> : null}
                </div>
              ) : null}
              {!canAdmin ? (
                <p className="text-sm text-slate-600">Only managers or admins can attest.</p>
              ) : (
                <Button onClick={() => void handleAttest()} disabled={attesting || attestationStatus === "ATTESTED"}>
                  {attesting ? "Submitting…" : attestationStatus === "ATTESTED" ? "Attested" : "Mark attested"}
                </Button>
              )}
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">Completions</h2>
            </div>
            <CompletionTable rows={progress} />
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">Analytics</h2>
              </div>
              {!canAdmin ? (
                <span className="text-xs text-slate-500">Admin only</span>
              ) : null}
            </div>
            {!canAdmin ? (
              <p className="text-sm text-slate-600">
                You need admin permissions to view analytics.
              </p>
            ) : analyticsError ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
                {analyticsError}
              </div>
            ) : analytics ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Starts" value={analytics.courseStarts ?? "—"} />
                  <MetricCard label="Completions" value={analytics.courseCompletions ?? "—"} />
                  <MetricCard label="Avg time" value={analytics.avgTime || "—"} />
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <table className="min-w-full bg-white text-left text-sm">
                    <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Lesson</th>
                        <th className="px-3 py-2">Started</th>
                        <th className="px-3 py-2">Completed</th>
                        <th className="px-3 py-2">Dropoff</th>
                        <th className="px-3 py-2">Avg time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(analytics.lessons || []).map((row: any) => (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 text-sm text-slate-800">
                            {row.title || "Lesson"}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {row.started ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {row.completed ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {row.dropoffRate ? `${row.dropoffRate}%` : "—"}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {row.avgTime || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Loading analytics…</p>
            )}
          </section>

          {plan === "SCALE" ? (
            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-slate-600" />
                  <h2 className="text-sm font-semibold text-slate-900">Advanced reporting</h2>
                </div>
              </div>
              {advancedError ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
                  {advancedError}
                </div>
              ) : advanced ? (
                <div className="space-y-3 text-sm text-slate-700">
                  <div>Funnels: {advanced.funnels ? JSON.stringify(advanced.funnels) : "—"}</div>
                  <div>Distributions: {advanced.distributions ? JSON.stringify(advanced.distributions) : "—"}</div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Loading advanced reporting…</p>
              )}
            </section>
          ) : (
            <UpgradeCard orgSlug={orgSlug} plan="SCALE" feature="Advanced reporting" />
          )}

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">SCORM export</h2>
                <p className="text-xs text-slate-600">Export a SCORM package.</p>
              </div>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={scormVersion}
                onChange={(e) => setScormVersion(e.target.value)}
              >
                <option value="SCORM_1_2">SCORM 1.2</option>
                <option value="SCORM_2004">SCORM 2004</option>
              </select>
            </div>
            <Button
              onClick={async () => {
                if (plan !== "SCALE") {
                  setShowScaleModal(true);
                  return;
                }
                try {
                  const res = await exportScorm(orgSlug, courseId, scormVersion);
                  const url = res?.url || res?.downloadUrl;
                  if (url) {
                    window.location.href = url as string;
                  } else {
                    alert("Export started.");
                  }
                } catch (err: any) {
                  alert(err?.message || "Export failed");
                }
              }}
            >
              Export SCORM
            </Button>
            {plan !== "SCALE" ? (
              <p className="mt-2 text-xs text-slate-500">Upgrade to Scale to export SCORM.</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">Versions</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                Current: v{(course as any)?.version || "1"}
              </span>
            </div>
            {plan === "STARTER" ? (
              <UpgradeCard orgSlug={orgSlug} plan="GROWTH" feature="Course versioning" />
            ) : (
              <>
                {releases.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
                    No releases yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <table className="min-w-full bg-white text-left text-sm">
                      <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Version</th>
                          <th className="px-3 py-2">Published</th>
                          <th className="px-3 py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {releases.map((r) => (
                          <tr key={r.id || r.version} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2 text-sm text-slate-800">v{r.version ?? "—"}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{r.publishedAt || "—"}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{r.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setPublishOpen(true)}>
                    Publish new version
                  </Button>
                  <Button variant="outline" onClick={() => setReassignOpen(true)}>
                    Reassign latest
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <button
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                onClick={() => router.push(`/org/${orgSlug}/learning/courses/new`)}
              >
                Create new course <MoveUp className="h-4 w-4 text-slate-500" />
              </button>
              <button
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                onClick={() => setInviteOpen(true)}
              >
                Invite to this course <MoveDown className="h-4 w-4 text-slate-500" />
              </button>
              {plan === "GROWTH" || plan === "SCALE" ? (
                <>
                  <button
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                    onClick={async () => {
                      try {
                        const res = await previewReminders(orgSlug, courseId);
                        alert(JSON.stringify(res));
                      } catch (err: any) {
                        alert(err?.message || "Preview failed");
                      }
                    }}
                  >
                    Preview reminders <MoveDown className="h-4 w-4 text-slate-500" />
                  </button>
                  <button
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                    onClick={async () => {
                      try {
                        await runReminders(orgSlug, courseId);
                        alert("Reminders running");
                      } catch (err: any) {
                        alert(err?.message || "Run failed");
                      }
                    }}
                  >
                    Run reminders now <MoveDown className="h-4 w-4 text-slate-500" />
                  </button>
                </>
              ) : (
                <UpgradeCard orgSlug={orgSlug} plan="GROWTH" feature="Due dates & reminders" />
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Video className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">Video status</h2>
            </div>
            <p className="text-xs text-slate-600">
              Add a VIDEO lesson, then upload a file. We&apos;ll poll Cloudflare until it&apos;s
              ready to stream.
            </p>
          </section>
        </div>
      </div>

      <InviteToCourseModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        courseId={courseId}
        orgSlug={orgSlug}
      />

      {quizPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Generated quiz</h3>
                <p className="text-sm text-slate-600">
                  Copy these questions or create a quiz lesson manually.
                </p>
              </div>
              <button
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setQuizPreview(null)}
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {quizPreview.map((q, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Q{idx + 1}. {q.text || q.question || "Question"}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {(q.choices || q.answers || []).map((c: any, i: number) => (
                      <li key={i}>- {c.label || c.text || c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setQuizPreview(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {publishOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Publish new version</h3>
                <p className="text-sm text-slate-600">Add release notes and publish.</p>
              </div>
              <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setPublishOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Notes</span>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  rows={3}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPublishOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await publishCourse(orgSlug, courseId, { notes: versionNotes || undefined });
                    alert("Published new version");
                    setPublishOpen(false);
                    setVersionNotes("");
                    const rel = await listReleases(orgSlug, courseId);
                    setReleases(Array.isArray(rel) ? rel : []);
                  } catch (err: any) {
                    alert(err?.message || "Publish failed");
                  }
                }}
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {reassignOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Reassign latest version</h3>
                <p className="text-sm text-slate-600">Choose scope and reminders.</p>
              </div>
              <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setReassignOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Scope</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={reassignScope}
                  onChange={(e) => setReassignScope(e.target.value)}
                >
                  <option value="COMPLETED_ONLY">Completed only</option>
                  <option value="ALL_ENROLLED">All enrolled</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Due days (optional)</span>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={reassignDue}
                  onChange={(e) => setReassignDue(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Message (optional)</span>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={reassignMessage}
                  onChange={(e) => setReassignMessage(e.target.value)}
                  rows={3}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReassignOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const res = await reassignLatest(orgSlug, courseId, {
                      scope: reassignScope,
                      dueDays: reassignDue === "" ? null : Number(reassignDue),
                      message: reassignMessage || null,
                    });
                    alert(res?.summary || "Reassign triggered");
                    setReassignOpen(false);
                    setReassignMessage("");
                    setReassignDue("");
                  } catch (err: any) {
                    alert(err?.message || "Reassign failed");
                  }
                }}
              >
                Reassign
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <UpgradeToScaleModal
        open={showScaleModal}
        onClose={() => setShowScaleModal(false)}
        orgSlug={orgSlug}
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value ?? "—"}</p>
    </div>
  );
}

function UpgradeCard({
  orgSlug,
  plan,
  feature,
}: {
  orgSlug: string;
  plan: string;
  feature: string;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="font-semibold">
        {feature} is available on {plan}.
      </div>
      <div className="mt-1">Upgrade in billing to unlock this feature.</div>
      <Button
        asChild
        size="sm"
        className="mt-2 bg-amber-900 text-amber-50 hover:bg-amber-800"
      >
        <a href={`/org/${orgSlug}/settings/billing`}>Go to billing</a>
      </Button>
    </div>
  );
}

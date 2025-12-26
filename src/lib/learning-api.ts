import api from "./api";

type WithData<T> = T | { data?: T } | { courses?: T } | { lessons?: T } | { assignments?: T };

function fromResponse<T>(res: any, key?: string): T {
  if (key && Array.isArray(res?.[key])) return res[key] as T;
  if (Array.isArray(res?.data) && !key) return res.data as T;
  if (key === "courses" && Array.isArray(res?.courses)) return res.courses as T;
  if (key === "lessons" && Array.isArray(res?.lessons)) return res.lessons as T;
  if (key === "assignments" && Array.isArray(res?.assignments)) return res.assignments as T;
  return res as T;
}

export async function listCourses(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/courses?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "courses") || [];
}

export async function createCourse(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/courses", { orgSlug, ...payload });
}

export async function getCourse(orgSlug: string, courseId: string) {
  return api.get<any>(`/learning/courses/${courseId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function createLesson(orgSlug: string, courseId: string, payload: Record<string, any>) {
  return api.post<any>(`/learning/courses/${courseId}/lessons`, { orgSlug, ...payload });
}

export async function updateLesson(orgSlug: string, lessonId: string, payload: Record<string, any>) {
  return api.patch<any>(`/learning/lessons/${lessonId}`, { orgSlug, ...payload });
}

export async function createDirectUpload(orgSlug: string, lessonId: string) {
  return api.post<any>("/learning/videos/direct-upload", { orgSlug, lessonId });
}

export async function getVideoAsset(orgSlug: string, videoAssetId: string) {
  return api.get<any>(`/learning/videos/${videoAssetId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function listAssignments(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/assignments?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "assignments") || [];
}

export async function createAssignment(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/assignments", { orgSlug, ...payload });
}

export async function getProgress(orgSlug: string, courseId: string) {
  return api.get<any>(`/learning/courses/${courseId}/progress?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function postLessonProgress(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>(`/learning/progress/lesson?orgSlug=${encodeURIComponent(orgSlug)}`, payload);
}

export async function startQuizAttempt(orgSlug: string, quizId: string, body?: Record<string, any>) {
  return api.post<any>(`/learning/quizzes/${quizId}/attempts`, { orgSlug, ...body });
}

export async function answerQuizAttempt(orgSlug: string, attemptId: string, body: Record<string, any>) {
  return api.post<any>(`/learning/quizzes/attempts/${attemptId}/answer`, { orgSlug, ...body });
}

export async function finishQuizAttempt(orgSlug: string, attemptId: string, body?: Record<string, any>) {
  return api.post<any>(`/learning/quizzes/attempts/${attemptId}/finish`, { orgSlug, ...body });
}

export async function postEvent(orgSlug: string, body: { type: string; courseId?: string; lessonId?: string; meta?: any }) {
  return api.post<any>("/learning/events", { orgSlug, ...body });
}

export async function getAdminAnalytics(orgSlug: string, courseId: string) {
  return api.get<any>(`/learning/courses/${courseId}/analytics?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function listRules(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/rules?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "data") || [];
}

export async function createRule(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/rules", { orgSlug, ...payload });
}

export async function updateRule(orgSlug: string, ruleId: string, payload: Record<string, any>) {
  return api.patch<any>(`/learning/rules/${ruleId}`, { orgSlug, ...payload });
}

export async function deleteRule(orgSlug: string, ruleId: string) {
  return api.delete<any>(`/learning/rules/${ruleId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function runRules(orgSlug: string) {
  return api.post<any>("/learning/rules/run", { orgSlug });
}

export async function quizFromLesson(orgSlug: string, lessonId: string, numQuestions = 5) {
  return api.post<any>("/learning/ai/quiz-from-lesson", { orgSlug, lessonId, numQuestions });
}

export async function summarizeLesson(orgSlug: string, lessonId: string) {
  return api.post<any>("/learning/ai/summarize-lesson", { orgSlug, lessonId });
}

export async function getRecommendations(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/ai/recommendations?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "data") || [];
}

export async function listNotifications(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/notifications?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "data") || [];
}

export async function markNotificationRead(orgSlug: string, notificationId: string) {
  return api.post<any>(`/learning/notifications/${notificationId}/read`, { orgSlug });
}

export async function listPacks(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/packs?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "packs") || [];
}

export async function createPack(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/packs", { orgSlug, ...payload });
}

export async function assignPack(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/packs/assign", { orgSlug, ...payload });
}

export async function deletePack(orgSlug: string, packId: string) {
  return api.delete<any>(`/learning/packs/${packId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function listExpiringCerts(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(
    `/learning/certifications/expiring?orgSlug=${encodeURIComponent(orgSlug)}`
  );
  return fromResponse<any[]>(res, "certifications") || [];
}

export async function listOverdueCerts(orgSlug: string) {
  try {
    const res = await api.get<WithData<any[]>>(
      `/learning/certifications/overdue?orgSlug=${encodeURIComponent(orgSlug)}`
    );
    return fromResponse<any[]>(res, "certifications") || [];
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export async function listAttestations(orgSlug: string) {
  try {
    const res = await api.get<WithData<any[]>>(
      `/learning/attestations?orgSlug=${encodeURIComponent(orgSlug)}`
    );
    return fromResponse<any[]>(res, "attestations") || [];
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export async function getComplianceRisk(orgSlug: string) {
  try {
    return await api.get<any>(`/learning/compliance/risk?orgSlug=${encodeURIComponent(orgSlug)}`);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function generateComplianceTasks(orgSlug: string) {
  return api.post<any>("/learning/compliance/tasks", { orgSlug });
}

export async function attestCompletion(orgSlug: string, courseId: string) {
  return api.post<any>(`/learning/courses/${courseId}/attest`, { orgSlug });
}

export async function listScorm(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/scorm?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "packages") || [];
}

export async function createScorm(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/scorm", { orgSlug, ...payload });
}

export async function previewReminders(orgSlug: string, courseId?: string) {
  const qs = courseId ? `&courseId=${encodeURIComponent(courseId)}` : "";
  return api.get<any>(`/learning/reminders/preview?orgSlug=${encodeURIComponent(orgSlug)}${qs}`);
}

export async function runReminders(orgSlug: string, courseId?: string) {
  return api.post<any>("/learning/reminders/run", { orgSlug, courseId });
}

export async function listAudit(orgSlug: string, params?: Record<string, any>) {
  const query = new URLSearchParams({ orgSlug, ...(params || {}) }).toString();
  const res = await api.get<WithData<any[]>>(`/learning/audit?${query}`);
  return fromResponse<any[]>(res, "data") || [];
}

export async function getMeGamification(orgSlug: string) {
  return api.get<any>(`/learning/gamification/me?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function getLeaderboard(orgSlug: string, period: string) {
  const res = await api.get<WithData<any[]>>(
    `/learning/leaderboard?orgSlug=${encodeURIComponent(orgSlug)}&period=${encodeURIComponent(period)}`
  );
  return fromResponse<any[]>(res, "data") || [];
}

export async function getAdvancedReporting(orgSlug: string, courseId: string) {
  return api.get<any>(`/learning/courses/${courseId}/advanced-reporting?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function exportScorm(orgSlug: string, courseId: string, version: string) {
  return api.post<any>(`/learning/courses/${courseId}/export-scorm`, { orgSlug, version });
}

export async function listMyCertificates(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/certificates?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "data") || [];
}

export async function certificateViewUrl(orgSlug: string, certificateId: string, opts?: { expiryDays?: number }) {
  const query = new URLSearchParams({ orgSlug });
  if (opts?.expiryDays) query.set("expiryDays", String(opts.expiryDays));
  const res = await api.get<any>(
    `/learning/certificates/${certificateId}/view?${query.toString()}`
  );
  if (typeof res === "string") return res;
  if (res?.url) return res.url as string;
  if (res?.viewUrl) return res.viewUrl as string;
  return "";
}

export async function listReleases(orgSlug: string, courseId: string) {
  const res = await api.get<WithData<any[]>>(
    `/learning/courses/${courseId}/releases?orgSlug=${encodeURIComponent(orgSlug)}`
  );
  return fromResponse<any[]>(res, "data") || [];
}

export async function publishCourse(orgSlug: string, courseId: string, payload?: { notes?: string }) {
  return api.post<any>(`/learning/courses/${courseId}/publish`, { orgSlug, ...(payload || {}) });
}

export async function reassignLatest(
  orgSlug: string,
  courseId: string,
  payload: { scope: string; dueDays?: number | null; message?: string | null }
) {
  return api.post<any>(`/learning/courses/${courseId}/reassign-latest`, { orgSlug, ...payload });
}

export async function digestPreview(orgSlug: string) {
  return api.get<any>(`/learning/digest/preview?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function digestRun(orgSlug: string) {
  return api.post<any>("/learning/digest/run", { orgSlug });
}

export async function listPaths(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(`/learning/paths?orgSlug=${encodeURIComponent(orgSlug)}`);
  return fromResponse<any[]>(res, "paths") || fromResponse<any[]>(res, "data") || [];
}

export async function createPath(orgSlug: string, payload: Record<string, any>) {
  return api.post<any>("/learning/paths", { orgSlug, ...payload });
}

export async function getPath(orgSlug: string, pathId: string) {
  return api.get<any>(`/learning/paths/${pathId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function updatePath(orgSlug: string, pathId: string, payload: Record<string, any>) {
  return api.patch<any>(`/learning/paths/${pathId}`, { orgSlug, ...payload });
}

export async function addCourseToPath(orgSlug: string, pathId: string, courseId: string) {
  return api.post<any>(`/learning/paths/${pathId}/courses`, { orgSlug, courseId });
}

export async function removeCourseFromPath(orgSlug: string, pathId: string, courseId: string) {
  return api.delete<any>(`/learning/paths/${pathId}/courses/${courseId}?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function assignPath(orgSlug: string, pathId: string, payload: Record<string, any>) {
  return api.post<any>(`/learning/paths/${pathId}/assign`, { orgSlug, ...payload });
}

export async function getTranscript(orgSlug: string, videoAssetId: string) {
  return api.get<any>(`/learning/videos/${videoAssetId}/transcript?orgSlug=${encodeURIComponent(orgSlug)}`);
}

export async function uploadTranscript(
  orgSlug: string,
  videoAssetId: string,
  payload: { text?: string; vtt?: string; srt?: string; language?: string }
) {
  return api.post<any>(`/learning/videos/${videoAssetId}/transcript`, { orgSlug, ...payload });
}

export async function aiQuizFromVideo(
  orgSlug: string,
  payload: { lessonId: string; numQuestions?: number; persist?: boolean }
) {
  return api.post<any>("/learning/ai/video-to-quiz", { orgSlug, ...payload });
}

export async function aiExplainAnswer(
  orgSlug: string,
  payload: { attemptId: string; questionId: string; choiceId: string }
) {
  return api.post<any>("/learning/ai/explain-answer", { orgSlug, ...payload });
}

export async function setCourseTags(orgSlug: string, courseId: string, tags: string[]) {
  return api.post<any>(`/learning/courses/${courseId}/tags`, { orgSlug, tags });
}

export async function getAiRecommendations(orgSlug: string) {
  const res = await api.get<WithData<any[]>>(
    `/learning/ai/recommendations?orgSlug=${encodeURIComponent(orgSlug)}`
  );
  return fromResponse<any[]>(res, "data") || [];
}

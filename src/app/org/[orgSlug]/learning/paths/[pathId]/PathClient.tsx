"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import {
  addCourseToPath,
  assignPath,
  getPath,
  listCourses,
  removeCourseFromPath,
  updatePath,
} from "@/lib/learning-api";

export default function PathClient({ orgSlug, pathId }: { orgSlug: string; pathId: string }) {
  const [path, setPath] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDays, setDueDays] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setRequestId(null);
      try {
        const [p, c] = await Promise.all([getPath(orgSlug, pathId), listCourses(orgSlug)]);
        if (!cancelled) {
          setPath(p);
          setCourses(c || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load path");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, pathId]);

  const handleAddCourse = async () => {
    if (!courseId) return;
    try {
      await addCourseToPath(orgSlug, pathId, courseId);
      const updated = await getPath(orgSlug, pathId);
      setPath(updated);
      setCourseId("");
    } catch (err: any) {
      alert(err?.message || "Unable to add course");
    }
  };

  const handleRemoveCourse = async (cid: string) => {
    try {
      await removeCourseFromPath(orgSlug, pathId, cid);
      const updated = await getPath(orgSlug, pathId);
      setPath(updated);
    } catch (err: any) {
      alert(err?.message || "Unable to remove course");
    }
  };

  const handleAssign = async () => {
    try {
      await assignPath(orgSlug, pathId, { userId: assignee, dueDays: dueDays === "" ? null : dueDays });
      alert("Path assigned");
    } catch (err: any) {
      alert(err?.message || "Unable to assign path");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <SupportErrorCard title="Path" message={error} requestId={requestId} />
      </div>
    );
  }

  if (!path) {
    return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Learning</p>
          <h1 className="text-2xl font-semibold text-slate-900">{path.title || "Path"}</h1>
          <p className="text-sm text-slate-600">{path.description || "No description yet."}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Courses</h2>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Add course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.id}
                </option>
              ))}
            </select>
            <Button onClick={handleAddCourse} disabled={!courseId}>
              Add
            </Button>
          </div>
        </div>
        {Array.isArray(path.courses) && path.courses.length > 0 ? (
          <div className="space-y-2">
            {path.courses.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">{c.title || "Course"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void handleRemoveCourse(c.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No courses in this path yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Assign path</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">User ID / Email</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="user@example.com"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Due days</span>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </label>
          <div className="flex items-end">
            <Button onClick={handleAssign} disabled={!assignee}>
              Assign
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

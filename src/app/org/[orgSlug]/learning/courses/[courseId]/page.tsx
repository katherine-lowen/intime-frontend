import CourseClient from "./CourseClient";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ orgSlug: string; courseId: string }>;
}) {
  const { orgSlug, courseId } = await params;

  return <CourseClient orgSlug={orgSlug} courseId={courseId} />;
}

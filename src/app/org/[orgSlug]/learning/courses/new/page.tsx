import CourseNewClient from "./CourseNewClient";

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <CourseNewClient orgSlug={orgSlug} />;
}

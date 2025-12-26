export default async function LearningAssignmentPage({
  params,
}: {
  params: Promise<{ orgSlug: string; assignmentId: string }>;
}) {
  const { orgSlug, assignmentId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900">Assignment</h1>
      <p className="text-sm text-slate-600">
        Org: {orgSlug} · Assignment ID: {assignmentId}
      </p>
      <p className="mt-2 text-sm text-slate-500">Details coming soon.</p>
    </div>
  );
}

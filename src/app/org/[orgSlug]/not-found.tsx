export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Organization not found</h1>
      <p className="mt-1 text-sm text-slate-600">
        We couldn&apos;t find this workspace. Check the URL or switch to a valid organization.
      </p>
    </div>
  );
}

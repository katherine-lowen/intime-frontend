export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-neutral-600">
          The page you’re looking for doesn’t exist or was moved.
        </p>
      </div>
    </div>
  );
}

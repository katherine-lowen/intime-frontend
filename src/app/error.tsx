"use client";
export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body className="p-6 text-sm text-red-700">
        Something went wrong: {error.message}
      </body>
    </html>
  );
}

"use client";

import { useState } from "react";

export default function ResumeUpload({ onUploaded }: { onUploaded: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/resume-upload", {
        method: "POST",
        body: form, // 🔥 DO NOT SET HEADERS
      });

      const data = await res.json();
      onUploaded(data); // returns { url, path, text }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={handleUpload}
        className="border p-2 rounded"
      />
      
      {loading && <p className="text-sm text-neutral-500">Uploading…</p>}
      {fileName && <p className="text-sm text-neutral-700">Uploaded: {fileName}</p>}
    </div>
  );
}

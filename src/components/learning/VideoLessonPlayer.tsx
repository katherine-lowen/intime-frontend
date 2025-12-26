"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { createDirectUpload, getVideoAsset } from "@/lib/learning-api";

type Lesson = {
  id: string;
  title?: string | null;
  videoAsset?: {
    videoAssetId?: string | null;
    streamUid?: string | null;
    status?: string | null;
    uploadUrl?: string | null;
  } | null;
};

type Props = {
  lesson: Lesson;
  orgSlug: string;
  mode?: "admin" | "learner";
  onUpdated?: (lesson: Partial<Lesson>) => void;
};

export default function VideoLessonPlayer({ lesson, orgSlug, mode = "learner", onUpdated }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [asset, setAsset] = useState(lesson.videoAsset ?? null);

  useEffect(() => {
    setAsset(lesson.videoAsset ?? null);
  }, [lesson.videoAsset]);

  const pollStatus = async (videoAssetId: string) => {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      try {
        const res: any = await getVideoAsset(orgSlug, videoAssetId);
        if (res?.status === "READY" || res?.video?.status === "READY") {
          setAsset(res);
          onUpdated?.({ videoAsset: res });
          return;
        }
        if (res?.status === "FAILED" || res?.video?.status === "FAILED") {
          setError("Video processing failed");
          return;
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        setError(err?.message || "Unable to check video status");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        return;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setError("Video still processing. Please try again later.");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setRequestId(null);
    try {
      const res: any = await createDirectUpload(orgSlug, lesson.id);
      const uploadUrl = res?.uploadURL;
      const videoAssetId = res?.videoAssetId;
      const streamUid = res?.streamUid;
      if (!uploadUrl || !videoAssetId) {
        setError("Upload not configured.");
        return;
      }
      // try PUT first, fallback to form POST
      try {
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });
      } catch {
        const form = new FormData();
        form.append("file", file);
        await fetch(uploadUrl, {
          method: "POST",
          body: form,
        });
      }
      setAsset({ ...(asset || {}), streamUid, status: "PROCESSING", videoAssetId });
      await pollStatus(videoAssetId);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  if (error) {
    return (
      <div className="w-full">
        <SupportErrorCard title="Video error" message={error} requestId={requestId} />
      </div>
    );
  }

  if (asset?.status === "READY" && asset?.streamUid) {
    return (
      <div className="w-full">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <iframe
            title={lesson.title || "Video lesson"}
            src={`https://iframe.videodelivery.net/${asset.streamUid}`}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className="h-48 w-full"
          />
        </div>
      </div>
    );
  }

  return mode === "admin" ? (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
      <input type="file" className="hidden" onChange={handleFileSelect} />
      {uploading ? "Uploading…" : "Upload video"}
    </label>
  ) : (
    <div className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-600">
      Video processing — come back soon
    </div>
  );
}

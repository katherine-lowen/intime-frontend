// src/app/api/resume-upload/route.ts
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs"; // needed so we can use Buffers + pdf-parse

async function extractTextFromBuffer(buffer: Buffer, ext: string): Promise<string> {
  try {
    if (ext === "pdf") {
      // Dynamic import avoids TS / CJS interop issues
      const pdfModule = await import("pdf-parse");
      const pdf: any = (pdfModule as any).default || pdfModule;
      const parsed = await pdf(buffer);
      return parsed.text || "";
    }

    if (ext === "txt") {
      return buffer.toString("utf8");
    }

    // Unsupported type for now — we still store the file, just no text
    return "";
  } catch (e) {
    console.error("[resume-upload] Text extraction failed:", e);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided (expected field 'file')" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || "resume";
    const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
    const timestamp = Date.now();
    const path = `uploads/${timestamp}-${originalName}`;

    // 1) Upload raw file to Supabase storage (bucket: resumes)
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[resume-upload] Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(path);

    // 2) Best-effort text extraction
    const text = await extractTextFromBuffer(buffer, ext);

    return NextResponse.json(
      {
        url: publicUrl,
        path,
        text,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[resume-upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to handle upload" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import api from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const applicantId = params.id;
  const form = await req.formData();
  const stage = form.get("stage");

  if (!stage || typeof stage !== "string") {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  try {
    // Update applicant
    await api.patch(`/applicants/${applicantId}`, { stage });

    // Log event
    await api.post(`/events`, {
      type: "STAGE_CHANGE",
      source: "system",
      summary: `Stage changed to ${stage}`,
      applicantId,
    });

    return NextResponse.redirect(`/people/${params.id}`);
  } catch (err) {
    console.error("Failed to update stage", err);
    return NextResponse.json(
      { error: "Failed to update stage" },
      { status: 500 }
    );
  }
}

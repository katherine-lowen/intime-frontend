// src/app/api/applicants/[id]/stage/route.ts
import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/api";

type Body = {
  stage?: string;
};

/**
 * Update an applicant/candidate stage.
 * Proxies to the backend /candidates/:id PATCH endpoint.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: Body = {};
  try {
    body = (await request.json()) ?? {};
  } catch {
    body = {};
  }

  if (!body.stage) {
    return NextResponse.json(
      { error: "Missing required field: stage" },
      { status: 400 }
    );
  }

  try {
    const updated = await api.patch(`/candidates/${id}`, {
      stage: body.stage,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating applicant stage:", err);
    return NextResponse.json(
      { error: "Failed to update applicant stage" },
      { status: 500 }
    );
  }
}

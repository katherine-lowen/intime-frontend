// src/app/api/timeoff/requests/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/api";

type Body = {
  status?: string;
};

/**
 * PATCH /api/timeoff/requests/[id]/status
 * Proxies to backend: PATCH /timeoff/requests/:id/status
 */
export async function PATCH(
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

  if (!body.status) {
    return NextResponse.json(
      { error: "Missing required field: status" },
      { status: 400 }
    );
  }

  try {
    const updated = await api.patch(`/timeoff/requests/${id}/status`, {
      status: body.status,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating time off request status:", err);
    return NextResponse.json(
      { error: "Failed to update time off request status" },
      { status: 500 }
    );
  }
}

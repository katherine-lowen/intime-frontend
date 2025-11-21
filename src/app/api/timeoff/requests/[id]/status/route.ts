// src/app/api/timeoff/requests/[id]/status/route.ts
import { NextResponse } from "next/server";
import api from "@/lib/api";

type TimeOffStatus =
  | "REQUESTED"
  | "APPROVED"
  | "DENIED"
  | "CANCELLED";

type Body = {
  status: TimeOffStatus;
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = (await req.json()) as Body;

    if (!body.status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    const updated = await api.patch(`/timeoff/requests/${id}/status`, {
      status: body.status,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("API timeoff status error", err);
    return NextResponse.json(
      { error: "Failed to update time off status" },
      { status: 500 }
    );
  }
}

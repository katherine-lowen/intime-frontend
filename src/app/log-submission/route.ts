import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      action,
      orgId,
      userId,
      status = "ATTEMPTED",
      payload,
      error,
    } = body;

    const { data, error: supabaseError } = await supabaseServer
      .from("user_submissions")
      .insert({
        action,
        org_id: orgId,
        user_id: userId,
        status,
        payload,
        error,
      })
      .select()
      .single();

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      return NextResponse.json({ error: "supabase insert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "unexpected error" }, { status: 500 });
  }
}

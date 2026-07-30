import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateUnsubscribeToken } from "@/lib/email";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id  = searchParams.get("id");
  const sig = searchParams.get("sig");

  if (!id || !sig) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const expected = generateUnsubscribeToken(id);
  if (sig !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("profiles")
    .update({ notif_marketing: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

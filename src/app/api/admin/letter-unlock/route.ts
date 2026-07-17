import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.LETTER_PASSWORD ?? "";
  if (!correct || password !== correct) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const db = supabaseAdmin();
  await db.from("settings").upsert(
    { key: "letter_opened_at", value: new Date().toISOString(), updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  return NextResponse.json({ ok: true });
}

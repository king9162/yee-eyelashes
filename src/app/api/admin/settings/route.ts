import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function auth(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  const { data, error } = await db.from("settings").select("key, value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("settings")
    .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

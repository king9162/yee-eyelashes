import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";

export const dynamic = "force-dynamic";

function auth(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("client_actions")
    .select("client_id, action_type, sent_at, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { client_id, action_type, sent_at } = await req.json();
  if (!client_id || !action_type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db
    .from("client_actions")
    .upsert({ client_id, action_type, sent_at: sent_at ?? todayNY() },
      { onConflict: "client_id,action_type" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { client_id, action_type } = await req.json();
  const db = supabaseAdmin();
  let q = db.from("client_actions").delete().eq("client_id", client_id);
  if (action_type) q = q.eq("action_type", action_type);
  const { error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

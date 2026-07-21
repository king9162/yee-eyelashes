import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("revenue_audit_log")
    .select("*")
    .order("changed_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { entry_id, action, changed_by, details } = await req.json();
  const db = supabaseAdmin();
  await db.from("revenue_audit_log").insert({ entry_id: entry_id ?? null, action, changed_by: changed_by ?? null, details: details ?? null });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

// Public — booking form fetches this
export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("blocked_dates")
    .select("date, reason")
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ blockedDates: [] });
  return NextResponse.json({ blockedDates: data });
}

// Admin — add a blocked date
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, reason } = await req.json();
  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db.from("blocked_dates").upsert({ date, reason: reason || null }, { onConflict: "date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// Admin — remove a blocked date
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date } = await req.json();
  const db = supabaseAdmin();
  const { error } = await db.from("blocked_dates").delete().eq("date", date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

// GET /api/admin/revenue — returns all entries, newest first
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("revenue_entries")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/revenue
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, client_name, service_label, amount, tip, payment_method, notes } = body;

  if (!date || !client_name) {
    return NextResponse.json({ error: "date and client_name are required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("revenue_entries").insert({
    date,
    client_name:     String(client_name).trim(),
    service_label:   String(service_label ?? "").trim(),
    amount:          parseFloat(amount) || 0,
    tip:             parseFloat(tip)    || 0,
    payment_method:  payment_method ?? "cash",
    notes:           notes ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

// GET /api/admin/revenue — auto-syncs booking placeholders, then returns all entries newest first
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();

  // ── Auto-sync: keep revenue in step with bookings (no Square API call) ──

  // 1. Delete $0 placeholders for cancelled/deleted bookings (today onwards)
  const { data: cancelledBookings } = await db
    .from("bookings")
    .select("date, name")
    .eq("status", "cancelled")
    .gte("date", today);

  for (const b of cancelledBookings ?? []) {
    if (!b.date || !b.name) continue;
    await db.from("revenue_entries")
      .delete()
      .eq("date", b.date)
      .eq("client_name", b.name)
      .eq("amount", 0)
      .is("square_payment_id", null);
  }

  // 2. Create $0 placeholders for confirmed bookings that have no revenue entry yet
  const { data: confirmedBookings } = await db
    .from("bookings")
    .select("date, name, service_label")
    .eq("status", "confirmed")
    .gte("date", today);

  if ((confirmedBookings ?? []).length > 0) {
    const { data: existingFwd } = await db
      .from("revenue_entries")
      .select("date, client_name")
      .gte("date", today);

    const existingKeys = new Set(
      (existingFwd ?? []).map(e => `${e.date}|${e.client_name}`)
    );

    for (const b of confirmedBookings ?? []) {
      if (!b.date || !b.name) continue;
      if (existingKeys.has(`${b.date}|${b.name}`)) continue;
      await db.from("revenue_entries").insert({
        date:          b.date,
        client_name:   b.name,
        service_label: b.service_label ?? "",
        amount:        0,
        tip:           0,
        payment_method: "cash",
      });
    }
  }

  // ── Return all entries, newest first ────────────────────────────────────
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
  const { date, client_name, service_label, amount, tip, payment_method, notes, recorded_by, changed_by } = body;

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
    recorded_by:     recorded_by ?? changed_by ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("revenue_audit_log").insert({
    entry_id: (data as Record<string, unknown>)?.id ?? null,
    action: "add",
    changed_by: changed_by ?? null,
    details: { client_name: String(client_name).trim(), date, amount: parseFloat(amount) || 0, payment_method: payment_method ?? "cash", service_label: String(service_label ?? "").trim() },
  });

  return NextResponse.json(data);
}

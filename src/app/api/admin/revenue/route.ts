import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";
import { tryAwardRevenuePoints } from "@/lib/revenue-points";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

// GET /api/admin/revenue — auto-syncs booking placeholders, then returns all entries newest first
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();

  // ── Auto-sync: keep revenue in step with bookings (no Square API call) ──

  // 1. Reconcile: delete $0 placeholders that no longer match a confirmed booking (today+)
  //    Handles cancellations, reschedules, and any other booking changes.
  const [{ data: zeroEntries }, { data: confirmedBookings }] = await Promise.all([
    db.from("revenue_entries")
      .select("id, date, client_name")
      .eq("amount", 0)
      .is("square_payment_id", null)
      .gte("date", today),
    db.from("bookings")
      .select("date, name, service_label")
      .eq("status", "confirmed")
      .gte("date", today),
  ]);

  const confirmedKeys = new Set(
    (confirmedBookings ?? []).map(b => `${b.date}|${b.name}`)
  );
  for (const entry of zeroEntries ?? []) {
    if (!confirmedKeys.has(`${entry.date}|${entry.client_name}`)) {
      await db.from("revenue_entries").delete().eq("id", entry.id);
    }
  }

  // 2. Create $0 placeholders for confirmed bookings that have no revenue entry yet

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

  const parsedAmount = parseFloat(amount) || 0;
  const db = supabaseAdmin();
  const { data, error } = await db.from("revenue_entries").insert({
    date,
    client_name:     String(client_name).trim(),
    service_label:   String(service_label ?? "").trim(),
    amount:          parsedAmount,
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
    details: { client_name: String(client_name).trim(), date, amount: parsedAmount, payment_method: payment_method ?? "cash", service_label: String(service_label ?? "").trim() },
  });

  // ── Auto-award points if amount > 0 and booking has a linked member ──
  const entryId = (data as Record<string, unknown>)?.id as string | undefined;
  if (parsedAmount > 0 && entryId) {
    tryAwardRevenuePoints({ db, entryId, date, clientName: String(client_name).trim(), amount: parsedAmount }).catch(() => {});
  }

  return NextResponse.json(data);
}


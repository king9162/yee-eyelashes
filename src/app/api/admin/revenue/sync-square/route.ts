import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await req.json().catch(() => ({}));
  const today   = todayNY();
  const db      = supabaseAdmin();
  const token   = process.env.SQUARE_ACCESS_TOKEN!;

  // ── Step 1: Import ALL confirmed bookings (today + future) as $0 placeholders ──
  const { data: upcomingBookings } = await db
    .from("bookings")
    .select("id, date, name, service_label, square_order_id")
    .eq("status", "confirmed")
    .gte("date", today);

  // Load existing revenue entries from today onwards
  const { data: existingFwd } = await db
    .from("revenue_entries")
    .select("id, date, client_name, amount, square_payment_id, service_label")
    .gte("date", today);

  type RevEntry = { id: string; date: string; client_name: string; amount: number; square_payment_id: string | null; service_label: string };
  const byKey = new Map<string, RevEntry>();
  for (const e of (existingFwd ?? []) as RevEntry[]) {
    byKey.set(`${e.date}|${e.client_name}`, e);
  }

  let bookingsSynced = 0;
  for (const b of upcomingBookings ?? []) {
    if (!b.name || !b.date) continue;
    const key = `${b.date}|${b.name}`;
    if (byKey.has(key)) continue;

    const { data: inserted } = await db.from("revenue_entries").insert({
      date:          b.date,
      client_name:   b.name,
      service_label: b.service_label ?? "",
      amount:        0,
      tip:           0,
      payment_method: "cash",
    }).select("id, date, client_name, amount, square_payment_id, service_label").single();

    if (inserted) {
      byKey.set(key, inserted as RevEntry);
      bookingsSynced++;
    }
  }

  // ── Step 2: Sync today's completed Square payments ──────────────
  const endTime   = new Date(today + "T23:59:59-04:00").toISOString();
  const beginTime = new Date(today + "T00:00:00-04:00").toISOString();

  let allPayments: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL("https://connect.squareup.com/v2/payments");
    url.searchParams.set("begin_time", beginTime);
    url.searchParams.set("end_time",   endTime);
    url.searchParams.set("status",     "COMPLETED");
    url.searchParams.set("limit",      "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res  = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}`, "Square-Version": "2024-01-18" } });
    const json = await res.json() as { payments?: Record<string, unknown>[]; cursor?: string };
    allPayments = allPayments.concat(json.payments ?? []);
    cursor = json.cursor;
  } while (cursor);

  // Existing square_payment_ids (all time)
  const { data: allExisting } = await db.from("revenue_entries").select("square_payment_id").not("square_payment_id", "is", null);
  const existingPaymentIds = new Set((allExisting ?? []).map(e => e.square_payment_id));

  // Bookings → order cross-reference
  const { data: bookingRows } = await db.from("bookings").select("square_order_id, name, service_label, date");
  const orderMap = new Map((bookingRows ?? []).filter(b => b.square_order_id).map(b => [b.square_order_id, b]));

  const customerCache = new Map<string, string>();
  async function getCustomerName(customerId: string): Promise<string> {
    if (customerCache.has(customerId)) return customerCache.get(customerId)!;
    try {
      const r = await fetch(`https://connect.squareup.com/v2/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json() as { customer?: { given_name?: string; family_name?: string } };
      const name = `${d.customer?.given_name ?? ""} ${d.customer?.family_name ?? ""}`.trim() || "Unknown";
      customerCache.set(customerId, name);
      return name;
    } catch { return "Unknown"; }
  }

  let synced = 0, skipped = 0;

  for (const p of allPayments) {
    const paymentId = p.id as string;
    if (existingPaymentIds.has(paymentId)) { skipped++; continue; }

    const amount = ((p.amount_money as Record<string,number>)?.amount ?? 0) / 100;
    const tip    = ((p.tip_money    as Record<string,number>)?.amount ?? 0) / 100;
    if (amount <= 0) { skipped++; continue; }

    const date = new Date(p.created_at as string).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const orderId = p.order_id as string | undefined;
    const booking = orderId ? orderMap.get(orderId) : undefined;
    let clientName   = booking?.name ?? "";
    let serviceLabel = booking?.service_label ?? "";

    if (!clientName && p.customer_id) clientName = await getCustomerName(p.customer_id as string);
    if (!clientName) clientName = "Square Customer";

    const key = `${date}|${clientName}`;
    const existing = byKey.get(key);

    if (existing && existing.amount === 0 && !existing.square_payment_id) {
      // Update the $0 booking placeholder with actual Square payment
      await db.from("revenue_entries").update({
        amount,
        tip,
        payment_method:    "square",
        square_payment_id: paymentId,
        service_label:     serviceLabel || existing.service_label,
        recorded_by:       "Square",
      }).eq("id", existing.id);
    } else {
      await db.from("revenue_entries").insert({
        date, client_name: clientName, service_label: serviceLabel,
        amount, tip, payment_method: "square", square_payment_id: paymentId,
        recorded_by: "Square",
      });
    }
    synced++;
  }

  return NextResponse.json({ synced, skipped, bookingsSynced, total: allPayments.length });
}

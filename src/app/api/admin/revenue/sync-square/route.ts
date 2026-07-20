import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const days = parseInt(body.days ?? "30") || 30;

  const today   = todayNY();
  const endTime = new Date(today + "T23:59:59-04:00").toISOString();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  const beginTime = new Date(startDate.toLocaleDateString("en-CA") + "T00:00:00-04:00").toISOString();

  // Fetch completed payments from Square
  const token = process.env.SQUARE_ACCESS_TOKEN!;
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

  const db = supabaseAdmin();

  // Fetch existing square_payment_ids so we don't double-insert
  const { data: existing } = await db.from("revenue_entries").select("square_payment_id").not("square_payment_id", "is", null);
  const existingIds = new Set((existing ?? []).map(e => e.square_payment_id));

  // Fetch bookings to cross-reference order_id → client name
  const { data: bookingRows } = await db.from("bookings").select("square_order_id, name, service_label, date");
  const orderMap = new Map((bookingRows ?? []).filter(b => b.square_order_id).map(b => [b.square_order_id, b]));

  // Cache Square customer lookups
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
    } catch {
      return "Unknown";
    }
  }

  let synced = 0;
  let skipped = 0;

  for (const p of allPayments) {
    const paymentId = p.id as string;
    if (existingIds.has(paymentId)) { skipped++; continue; }

    const amountCents = ((p.amount_money as Record<string,number>)?.amount ?? 0);
    const tipCents    = ((p.tip_money    as Record<string,number>)?.amount ?? 0);
    const amount = amountCents / 100;
    const tip    = tipCents    / 100;

    // Skip $0 payments
    if (amount <= 0) { skipped++; continue; }

    const createdAt = p.created_at as string;
    const date = new Date(createdAt).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

    // Try to get client name from booking
    const orderId  = p.order_id as string | undefined;
    const booking  = orderId ? orderMap.get(orderId) : undefined;
    let clientName    = booking?.name ?? "";
    let serviceLabel  = booking?.service_label ?? "";

    if (!clientName && p.customer_id) {
      clientName = await getCustomerName(p.customer_id as string);
    }
    if (!clientName) clientName = "Square Customer";

    await db.from("revenue_entries").insert({
      date,
      client_name:      clientName,
      service_label:    serviceLabel,
      amount,
      tip,
      payment_method:   "square",
      square_payment_id: paymentId,
    });
    synced++;
  }

  return NextResponse.json({ synced, skipped, total: allPayments.length });
}

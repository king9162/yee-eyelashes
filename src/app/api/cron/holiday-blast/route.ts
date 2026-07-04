import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSMS }       from "@/lib/sms";
import { todayNY }       from "@/lib/date";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader  = req.headers.get("authorization");
  const validTokens = [`Bearer ${process.env.CRON_SECRET}`, `Bearer ${process.env.ADMIN_SECRET_KEY}`];
  if (!validTokens.includes(authHeader ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db    = supabaseAdmin();
  const today = todayNY();

  // Read scheduled blast
  const { data: setting } = await db
    .from("settings").select("value").eq("key", "scheduled_blast").maybeSingle();
  if (!setting?.value) return NextResponse.json({ skipped: true, reason: "nothing scheduled" });

  let blast: { message: string; sendAt: string; label: string };
  try { blast = JSON.parse(setting.value); } catch { return NextResponse.json({ skipped: true, reason: "invalid json" }); }

  if (blast.sendAt > today) {
    return NextResponse.json({ skipped: true, reason: `scheduled for ${blast.sendAt}` });
  }

  // Get eligible clients — same logic as My Clients (sorted by latest non-cancelled visit, exclude cancelled-only)
  const [{ data: rawClients }, { data: cancelledBookings }, { data: unsubActions }, { data: alreadySent }] = await Promise.all([
    db.from("clients").select("id, phone, visit_date").not("deleted", "eq", true).not("phone", "is", null).neq("owner", "elly"),
    db.from("bookings").select("phone, date").eq("status", "cancelled"),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const normPhone = (p: string) => p?.replace(/\D/g, "").slice(-10) ?? "";

  const cancelledMap = new Map<string, Set<string>>();
  for (const b of cancelledBookings ?? []) {
    const ph = normPhone(b.phone ?? ""); if (!ph || !b.date) continue;
    if (!cancelledMap.has(ph)) cancelledMap.set(ph, new Set());
    cancelledMap.get(ph)!.add(b.date);
  }

  const idToPhone = new Map((rawClients ?? []).map(c => [c.id, normPhone(c.phone ?? "")]));
  const unsubPhones       = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const alreadySentPhones = new Set((alreadySent  ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  // Group by phone → find latest non-cancelled visit
  const grouped = new Map<string, { id: string; phone: string; visitDates: string[] }>();
  for (const c of rawClients ?? []) {
    const ph = normPhone(c.phone ?? ""); if (!ph) continue;
    if (!grouped.has(ph)) grouped.set(ph, { id: c.id, phone: c.phone, visitDates: [] });
    if (c.visit_date) grouped.get(ph)!.visitDates.push(c.visit_date);
  }

  const clients = Array.from(grouped.values()).filter(g => {
    const ph = normPhone(g.phone);
    const cancelled = cancelledMap.get(ph) ?? new Set<string>();
    const hasRealVisit = g.visitDates.some(d => d && !cancelled.has(d));
    return hasRealVisit && !unsubPhones.has(ph) && !alreadySentPhones.has(ph);
  });

  const results = await Promise.allSettled(
    clients.map(async (c) => {
      const digits = c.phone.replace(/\D/g, "");
      const e164   = digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
      await sendSMS(e164, blast.message);
      await db.from("client_actions").insert({
        client_id:   c.id,
        action_type: "holiday-blast-sms",
        sent_at:     today,
      });
    })
  );

  // Clear the scheduled blast so it doesn't fire again
  await db.from("settings").upsert(
    { key: "scheduled_blast", value: "", updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;
  return NextResponse.json({ sent, failed, label: blast.label, date: today });
}

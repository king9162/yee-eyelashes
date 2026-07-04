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

  // Get eligible clients — same as My Clients (owner != elly, dedup by phone, skip nameless)
  const [{ data: rawClients }, { data: unsubActions }, { data: alreadySent }] = await Promise.all([
    db.from("clients").select("id, first_name, last_name, phone").not("deleted", "eq", true).not("phone", "is", null).neq("owner", "elly"),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const normPhone = (p: string) => p?.replace(/\D/g, "").slice(-10) ?? "";
  const idToPhone = new Map((rawClients ?? []).map(c => [c.id, normPhone(c.phone ?? "")]));
  const unsubPhones       = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const alreadySentPhones = new Set((alreadySent  ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  const grouped = new Map<string, { id: string; first_name: string; last_name: string; phone: string }>();
  for (const c of rawClients ?? []) {
    const ph = normPhone(c.phone ?? ""); if (!ph) continue;
    if (!grouped.has(ph)) grouped.set(ph, { id: c.id, first_name: c.first_name ?? "", last_name: c.last_name ?? "", phone: c.phone });
    const g = grouped.get(ph)!;
    if (!g.first_name && c.first_name) g.first_name = c.first_name;
    if (!g.last_name  && c.last_name)  g.last_name  = c.last_name;
  }

  const clients = Array.from(grouped.values()).filter(g => {
    if (!`${g.first_name} ${g.last_name}`.trim()) return false;
    const ph = normPhone(g.phone);
    return !unsubPhones.has(ph) && !alreadySentPhones.has(ph);
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

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendGoogleReviewEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { todayNY } from "@/lib/date";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const validTokens = [`Bearer ${process.env.CRON_SECRET}`, `Bearer ${process.env.ADMIN_SECRET_KEY}`];
  if (!validTokens.includes(authHeader ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const [{ data: emailSetting }, { data: smsSetting }] = await Promise.all([
    db.from("settings").select("value").eq("key", "review-email").maybeSingle(),
    db.from("settings").select("value").eq("key", "review-sms").maybeSingle(),
  ]);
  const emailOn = emailSetting?.value !== "false";
  const smsOn   = smsSetting?.value !== "false";
  if (!emailOn && !smsOn) return NextResponse.json({ skipped: true, reason: "disabled" });

  const targetDate = todayNY();

  const { data: todayClients, error } = await db
    .from("clients")
    .select("id, first_name, last_name, phone, email")
    .eq("visit_date", targetDate)
    .not("deleted", "eq", true);

  if (error) {
    console.error("Cron review query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deduplicate by phone/email (same as My Clients grouping logic)
  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();
  const dedupedClients = (todayClients ?? []).filter(c => {
    const ph = c.phone?.replace(/\D/g, "").slice(-10);
    if (ph && seenPhones.has(ph)) return false;
    if (c.email && seenEmails.has(c.email)) return false;
    if (ph) seenPhones.add(ph);
    if (c.email) seenEmails.add(c.email);
    return true;
  });

  const { data: noReviewActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "no-review");
  const noReviewClientIds = new Set((noReviewActions ?? []).map(a => a.client_id));

  const { data: blockedActions } = await db.from("client_actions").select("client_id").eq("action_type", "blocked");
  const blockedPhones = new Set<string>();
  if ((blockedActions ?? []).length > 0) {
    const { data: bClients } = await db.from("clients").select("phone").in("id", blockedActions!.map(a => a.client_id));
    for (const bc of bClients ?? []) { const ph = (bc.phone ?? "").replace(/\D/g,"").slice(-10); if (ph) blockedPhones.add(ph); }
  }

  // Per-channel dedup — covers both manual and auto sends
  const [{ data: emailSentToday }, { data: smsSentToday }, { data: unsubActions }, { data: cancelledToday }] = await Promise.all([
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-review-email", "auto-review", "review-email"])
      .eq("sent_at", targetDate),
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-review-sms", "auto-review", "review-sms"])
      .eq("sent_at", targetDate),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    // Skip clients whose appointment today was cancelled
    db.from("bookings").select("phone, email").eq("date", targetDate).eq("status", "cancelled"),
  ]);
  const emailSentIds    = new Set((emailSentToday ?? []).map(a => a.client_id));
  const smsSentIds      = new Set((smsSentToday  ?? []).map(a => a.client_id));
  const unsubIds        = new Set((unsubActions  ?? []).map(a => a.client_id));
  const cancelledPhones = new Set((cancelledToday ?? []).map(b => b.phone?.replace(/\D/g,"").slice(-10)).filter(Boolean));
  const cancelledEmails = new Set((cancelledToday ?? []).map(b => b.email).filter(Boolean));

  const reviewLink = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/yee-eyelashes";
  const smsText = (name: string) =>
    `Hi ${name}! Thank you for your visit at Yee Eyelashes 🌸 We'd love your feedback. Please leave us a Google review: ${reviewLink}  📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  type EligibleClient = typeof todayClients extends (infer T)[] | null ? T & { shouldEmail: boolean; shouldSms: boolean } : never;
  const eligible: EligibleClient[] = dedupedClients.flatMap(c => {
    const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
    if (!name) return []; // skip nameless records (bad Square sync data)
    if (noReviewClientIds.has(c.id)) return [];
    const phone = c.phone?.replace(/\D/g,"").slice(-10);
    if (phone && blockedPhones.has(phone)) return [];
    // Skip if their booking today was cancelled
    if ((phone && cancelledPhones.has(phone)) || (c.email && cancelledEmails.has(c.email))) return [];
    const shouldEmail = emailOn && !!c.email && !emailSentIds.has(c.id);
    const shouldSms   = smsOn   && !!c.phone && !smsSentIds.has(c.id) && !unsubIds.has(c.id);
    if (!shouldEmail && !shouldSms) return [];
    return [{ ...c, shouldEmail, shouldSms }];
  });

  const results = await Promise.allSettled(
    eligible.map(async (c) => {
      const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.first_name;
      await Promise.all([
        c.shouldEmail
          ? sendGoogleReviewEmail({ name, email: c.email }).catch(e => console.error("Email error:", e))
          : Promise.resolve(),
        c.shouldSms
          ? sendSMS(c.phone, smsText(name)).catch(e => console.error("SMS error:", e))
          : Promise.resolve(),
      ]);

      if (c.shouldEmail) await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-review-email", sent_at: targetDate },
        { onConflict: "client_id,action_type" }
      );
      if (c.shouldSms) await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-review-sms", sent_at: targetDate },
        { onConflict: "client_id,action_type" }
      );

      await db.from("bookings")
        .update({ review_sent_at: new Date().toISOString() })
        .eq("date", targetDate)
        .neq("status", "cancelled")
        .is("review_sent_at", null)
        .or(`phone.eq.${c.phone},email.eq.${c.email}`);
    })
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, date: targetDate });
}

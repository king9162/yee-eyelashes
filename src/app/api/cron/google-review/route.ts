import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendGoogleReviewEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { todayNY } from "@/lib/date";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const [{ data: emailSetting }, { data: smsSetting }] = await Promise.all([
    db.from("settings").select("value").eq("key", "review-email").maybeSingle(),
    db.from("settings").select("value").eq("key", "review-sms").maybeSingle(),
  ]);
  const emailOn = emailSetting?.value !== "false";
  const smsOn   = smsSetting?.value === "true";
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

  const { data: noReviewActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "no-review");
  const noReviewClientIds = new Set((noReviewActions ?? []).map(a => a.client_id));

  // Per-channel dedup — covers both manual and auto sends
  const [{ data: emailSentToday }, { data: smsSentToday }, { data: unsubActions }] = await Promise.all([
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-review-email", "auto-review", "review-email"])
      .eq("sent_at", targetDate),
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-review-sms", "auto-review", "review-sms"])
      .eq("sent_at", targetDate),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
  ]);
  const emailSentIds = new Set((emailSentToday ?? []).map(a => a.client_id));
  const smsSentIds   = new Set((smsSentToday  ?? []).map(a => a.client_id));
  const unsubIds     = new Set((unsubActions  ?? []).map(a => a.client_id));

  const reviewLink = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/yee-eyelashes";
  const smsText = (name: string) =>
    `Hi ${name}! Thank you for your visit at Yee Eyelashes 🌸 We'd love your feedback. Please leave us a Google review: ${reviewLink}  📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  type EligibleClient = typeof todayClients extends (infer T)[] | null ? T & { shouldEmail: boolean; shouldSms: boolean } : never;
  const eligible: EligibleClient[] = (todayClients ?? []).flatMap(c => {
    if (noReviewClientIds.has(c.id)) return [];
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

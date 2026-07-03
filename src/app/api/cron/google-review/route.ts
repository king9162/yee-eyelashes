import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendGoogleReviewEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  // Check if automations are enabled
  const [{ data: emailSetting }, { data: smsSetting }] = await Promise.all([
    db.from("settings").select("value").eq("key", "review-email").maybeSingle(),
    db.from("settings").select("value").eq("key", "review-sms").maybeSingle(),
  ]);
  const emailOn = emailSetting?.value !== "false";
  const smsOn   = smsSetting?.value === "true";
  if (!emailOn && !smsOn) return NextResponse.json({ skipped: true, reason: "disabled" });

  // Target = today in NY time (cron runs at 00:30 UTC = 8:30 PM EDT)
  const targetDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  // Query clients whose most recent visit was today
  const { data: todayClients, error } = await db
    .from("clients")
    .select("id, first_name, last_name, phone, email")
    .eq("visit_date", targetDate)
    .not("deleted", "eq", true);

  if (error) {
    console.error("Cron review query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Exclude clients who opted out of auto review
  const { data: noReviewActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "no-review");
  const noReviewClientIds = new Set((noReviewActions ?? []).map(a => a.client_id));

  // Exclude clients already sent today (auto-review action with today's date)
  const { data: alreadySentActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "auto-review")
    .eq("sent_at", targetDate);
  const alreadySentIds = new Set((alreadySentActions ?? []).map(a => a.client_id));

  const eligible = (todayClients ?? []).filter(c => {
    if (noReviewClientIds.has(c.id)) return false;
    if (alreadySentIds.has(c.id)) return false;
    return (emailOn && c.email) || (smsOn && c.phone);
  });

  const reviewLink = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/yee-eyelashes";
  const smsText = (name: string) =>
    `Hi ${name}! Thank you for your visit at Yee Eyelashes 🌸 We'd love your feedback. Please leave us a Google review: ${reviewLink}  📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  const results = await Promise.allSettled(
    eligible.map(async (c) => {
      const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.first_name;
      await Promise.all([
        emailOn && c.email
          ? sendGoogleReviewEmail({ name, email: c.email })
          : Promise.resolve(),
        smsOn && c.phone
          ? sendSMS(c.phone, smsText(name)).catch(e => console.error("SMS error:", e))
          : Promise.resolve(),
      ]);
      // Mark as sent in client_actions
      await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-review", sent_at: targetDate },
        { onConflict: "client_id,action_type" }
      );
      // Also update matching bookings.review_sent_at for Send History display
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

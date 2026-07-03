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

  // Find bookings from today in NY time (cron runs at 00:30 UTC = 8:30 PM EDT)
  const targetDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  const { data: bookings, error } = await db
    .from("bookings")
    .select("id, name, email, phone, service_label")
    .eq("date", targetDate)
    .neq("status", "cancelled")
    .is("review_sent_at", null);

  if (error) {
    console.error("Cron review query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fallback: fill missing phone/email from clients table by name
  const { data: allClients } = await db.from("clients").select("first_name, last_name, phone, email");
  const clientByName = new Map<string, { phone: string; email: string }>();
  for (const c of allClients ?? []) {
    const full  = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim().toLowerCase();
    const first = (c.first_name ?? "").trim().toLowerCase();
    const entry = { phone: c.phone ?? "", email: c.email ?? "" };
    if (full)  clientByName.set(full,  entry);
    if (first) clientByName.set(first, entry);
  }
  const enrichedBookings = (bookings ?? []).map(b => {
    if (b.phone || b.email) return b;
    const found = clientByName.get((b.name ?? "").trim().toLowerCase());
    return found ? { ...b, phone: found.phone, email: found.email } : b;
  });

  // Exclude clients who opted out of auto review
  const { data: noReviewActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "no-review");
  const noReviewClientIds = new Set((noReviewActions ?? []).map(a => a.client_id));

  let noReviewPhones = new Set<string>();
  if (noReviewClientIds.size > 0) {
    const { data: noReviewClients } = await db
      .from("clients")
      .select("phone")
      .in("id", [...noReviewClientIds]);
    noReviewPhones = new Set(
      (noReviewClients ?? []).map(c => c.phone?.replace(/\D/g, "").slice(-10)).filter(Boolean)
    );
  }

  const eligible = enrichedBookings.filter(b => {
    const phone10 = b.phone?.replace(/\D/g, "").slice(-10);
    if (phone10 && noReviewPhones.has(phone10)) return false;
    return (emailOn && b.email) || (smsOn && b.phone);
  });

  const reviewLink = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/yee-eyelashes";
  const smsText = (name: string) =>
    `Hi ${name}! Thank you for your visit at Yee Eyelashes 🌸 We'd love your feedback. Please leave us a Google review: ${reviewLink}  📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  const results = await Promise.allSettled(
    eligible.map(async (b) => {
      await Promise.all([
        emailOn && b.email
          ? sendGoogleReviewEmail({ name: b.name, email: b.email })
          : Promise.resolve(),
        smsOn && b.phone
          ? sendSMS(b.phone, smsText(b.name)).catch(e => console.error("SMS error:", e))
          : Promise.resolve(),
      ]);
      await db.from("bookings").update({ review_sent_at: new Date().toISOString() }).eq("id", b.id);
    })
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, date: targetDate });
}

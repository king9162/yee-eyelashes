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

  // Find bookings from yesterday (cron runs at midnight UTC = 8 PM EDT)
  const target = new Date();
  target.setDate(target.getDate() - 1);
  const targetDate = target.toISOString().split("T")[0];

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

  const eligible = (bookings ?? []).filter(b =>
    (emailOn && b.email) || (smsOn && b.phone)
  );

  const reviewLink = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/yee-eyelashes";
  const smsText = (name: string) =>
    `Hi ${name}! Thank you for your visit at Yee Eyelashes 🌸 We'd love your feedback — please leave us a Google review: ${reviewLink}  📍 278 Plandome Rd, Manhasset · 929-806-2467`;

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

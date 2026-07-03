import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin }          from "@/lib/supabase";
import { sendRefillReminderEmail } from "@/lib/email";
import { sendSMS }                from "@/lib/sms";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  // Check if automations are enabled
  const [{ data: emailSetting }, { data: smsSetting }] = await Promise.all([
    db.from("settings").select("value").eq("key", "refill-email").maybeSingle(),
    db.from("settings").select("value").eq("key", "refill-sms").maybeSingle(),
  ]);
  const emailOn = emailSetting?.value !== "false";
  const smsOn   = smsSetting?.value === "true";
  if (!emailOn && !smsOn) return NextResponse.json({ skipped: true, reason: "disabled" });

  // Configurable refill window (default 14 days)
  const { data: daysSetting } = await db.from("settings").select("value").eq("key", "refill_days").maybeSingle();
  const refillDays = Math.max(1, parseInt(daysSetting?.value ?? "14") || 14);

  // Target = today minus refillDays in NY time
  const todayNY = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const target  = new Date(todayNY + "T12:00:00");
  target.setDate(target.getDate() - refillDays);
  const targetDate = target.toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  // Query clients whose most recent visit was refillDays ago
  const { data: targetClients, error } = await db
    .from("clients")
    .select("id, first_name, last_name, phone, email")
    .eq("visit_date", targetDate)
    .not("deleted", "eq", true);

  if (error) {
    console.error("Cron refill query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Exclude clients who opted out of auto refill
  const { data: noRefillActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "no-refill");
  const noRefillClientIds = new Set((noRefillActions ?? []).map(a => a.client_id));

  // Exclude clients already sent for this visit date
  const { data: alreadySentActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "auto-refill")
    .eq("sent_at", targetDate);
  const alreadySentIds = new Set((alreadySentActions ?? []).map(a => a.client_id));

  // Exclude clients who already have an upcoming booking in the next 14 days
  const twoWeeksLater = new Date(todayNY + "T12:00:00");
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  const twoWeeksDate = twoWeeksLater.toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  const { data: upcomingBookings } = await db
    .from("bookings")
    .select("phone, email")
    .gte("date", todayNY)
    .lte("date", twoWeeksDate)
    .neq("status", "cancelled");

  const upcomingPhones = new Set(
    (upcomingBookings ?? []).map(b => b.phone?.replace(/\D/g, "").slice(-10)).filter(Boolean)
  );
  const upcomingEmails = new Set(
    (upcomingBookings ?? []).map(b => b.email).filter(Boolean)
  );

  const eligible = (targetClients ?? []).filter(c => {
    if (noRefillClientIds.has(c.id)) return false;
    if (alreadySentIds.has(c.id)) return false;
    const phone = c.phone?.replace(/\D/g, "").slice(-10);
    const hasUpcoming = (phone && upcomingPhones.has(phone)) || (c.email && upcomingEmails.has(c.email));
    if (hasUpcoming) return false;
    return (emailOn && c.email) || (smsOn && c.phone);
  });

  const bookUrl = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";
  const smsText = (name: string) =>
    `Hi ${name}! It's been 2 weeks since your last lash appointment at Yee Eyelashes! Perfect time for a refill. Book now: ${bookUrl}  📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  const results = await Promise.allSettled(
    eligible.map(async (c) => {
      const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.first_name;
      await Promise.all([
        emailOn && c.email
          ? sendRefillReminderEmail({
              name,
              email:        c.email,
              phone:        c.phone,
              serviceLabel: "睫毛嫁接",
            })
          : Promise.resolve(),
        smsOn && c.phone
          ? sendSMS(c.phone, smsText(name)).catch(e => console.error("SMS error:", e))
          : Promise.resolve(),
      ]);
      // Mark as sent in client_actions
      await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-refill", sent_at: targetDate },
        { onConflict: "client_id,action_type" }
      );
      // Also update matching bookings.refill_sent_at for Send History display
      await db.from("bookings")
        .update({ refill_sent_at: new Date().toISOString() })
        .eq("date", targetDate)
        .neq("status", "cancelled")
        .is("refill_sent_at", null)
        .or(`phone.eq.${c.phone},email.eq.${c.email}`);
    })
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, date: targetDate });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin }          from "@/lib/supabase";
import { sendRefillReminderEmail } from "@/lib/email";
import { sendSMS }                from "@/lib/sms";
import { todayNY, offsetDateNY }  from "@/lib/date";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const validTokens = [`Bearer ${process.env.CRON_SECRET}`, `Bearer ${process.env.ADMIN_SECRET_KEY}`];
  if (!validTokens.includes(authHeader ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const [{ data: emailSetting }, { data: smsSetting }] = await Promise.all([
    db.from("settings").select("value").eq("key", "refill-email").maybeSingle(),
    db.from("settings").select("value").eq("key", "refill-sms").maybeSingle(),
  ]);
  const emailOn = emailSetting?.value !== "false";
  const smsOn   = smsSetting?.value !== "false";
  if (!emailOn && !smsOn) return NextResponse.json({ skipped: true, reason: "disabled" });

  const { data: daysSetting } = await db.from("settings").select("value").eq("key", "refill_days").maybeSingle();
  const refillDays = Math.max(1, parseInt(daysSetting?.value ?? "14") || 14);

  const today      = todayNY();
  const targetDate = offsetDateNY(today, -refillDays);

  const { data: targetClients, error } = await db
    .from("clients")
    .select("id, first_name, last_name, phone, email")
    .eq("visit_date", targetDate)
    .not("deleted", "eq", true);

  if (error) {
    console.error("Cron refill query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: noRefillActions } = await db
    .from("client_actions")
    .select("client_id")
    .eq("action_type", "no-refill");
  const noRefillClientIds = new Set((noRefillActions ?? []).map(a => a.client_id));

  // Per-channel dedup:
  // Auto sends: stored with sent_at = targetDate (visit date), check exact match
  // Manual sends: stored with sent_at = send date (today), check >= visit date to catch same-day manual sends
  const [
    { data: autoEmailSent }, { data: autoSmsSent },
    { data: manualEmailSent }, { data: manualSmsSent },
    { data: unsubActions },
  ] = await Promise.all([
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-refill-email", "auto-refill"]).eq("sent_at", targetDate),
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-refill-sms",   "auto-refill"]).eq("sent_at", targetDate),
    db.from("client_actions").select("client_id")
      .eq("action_type", "refill-email").gte("sent_at", targetDate),
    db.from("client_actions").select("client_id")
      .eq("action_type", "refill-sms").gte("sent_at", targetDate),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
  ]);
  const emailSentIds = new Set([
    ...(autoEmailSent   ?? []).map(a => a.client_id),
    ...(manualEmailSent ?? []).map(a => a.client_id),
  ]);
  const smsSentIds = new Set([
    ...(autoSmsSent   ?? []).map(a => a.client_id),
    ...(manualSmsSent ?? []).map(a => a.client_id),
  ]);
  const unsubIds = new Set((unsubActions ?? []).map(a => a.client_id));

  const twoWeeksDate = offsetDateNY(today, 14);
  const [{ data: upcomingBookings }, { data: cancelledOnTarget }] = await Promise.all([
    // Skip clients who already have an upcoming booking in the next 14 days
    db.from("bookings").select("phone, email")
      .gte("date", today).lte("date", twoWeeksDate).neq("status", "cancelled"),
    // Skip clients whose visit on targetDate was actually cancelled
    db.from("bookings").select("phone, email")
      .eq("date", targetDate).eq("status", "cancelled"),
  ]);

  const upcomingPhones = new Set(
    (upcomingBookings ?? []).map(b => b.phone?.replace(/\D/g, "").slice(-10)).filter(Boolean)
  );
  const upcomingEmails = new Set(
    (upcomingBookings ?? []).map(b => b.email).filter(Boolean)
  );
  const cancelledPhones = new Set(
    (cancelledOnTarget ?? []).map(b => b.phone?.replace(/\D/g, "").slice(-10)).filter(Boolean)
  );
  const cancelledEmails = new Set(
    (cancelledOnTarget ?? []).map(b => b.email).filter(Boolean)
  );

  type EligibleClient = typeof targetClients extends (infer T)[] | null ? T & { shouldEmail: boolean; shouldSms: boolean } : never;
  const eligible: EligibleClient[] = (targetClients ?? []).flatMap(c => {
    const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
    if (!name) return []; // skip nameless records (bad Square sync data)
    if (noRefillClientIds.has(c.id)) return [];
    const phone = c.phone?.replace(/\D/g, "").slice(-10);
    // Skip if their booking on targetDate was cancelled
    const wasCancelled = (phone && cancelledPhones.has(phone)) || (c.email && cancelledEmails.has(c.email));
    if (wasCancelled) return [];
    const hasUpcoming = (phone && upcomingPhones.has(phone)) || (c.email && upcomingEmails.has(c.email));
    if (hasUpcoming) return [];
    const shouldEmail = emailOn && !!c.email && !emailSentIds.has(c.id);
    const shouldSms   = smsOn   && !!c.phone && !smsSentIds.has(c.id) && !unsubIds.has(c.id);
    if (!shouldEmail && !shouldSms) return [];
    return [{ ...c, shouldEmail, shouldSms }];
  });

  const bookUrl = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";
  const smsText = (name: string) =>
    `Hi ${name}! It's been 2 weeks since your last lash appointment at Yee Eyelashes! Perfect time for a refill. Book now: ${bookUrl}  📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  const results = await Promise.allSettled(
    eligible.map(async (c) => {
      const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.first_name;
      await Promise.all([
        c.shouldEmail
          ? sendRefillReminderEmail({ name, email: c.email, phone: c.phone, serviceLabel: "睫毛嫁接" })
              .catch(e => console.error("Email error:", e))
          : Promise.resolve(),
        c.shouldSms
          ? sendSMS(c.phone, smsText(name)).catch(e => console.error("SMS error:", e))
          : Promise.resolve(),
      ]);

      if (c.shouldEmail) await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-refill-email", sent_at: targetDate },
        { onConflict: "client_id,action_type" }
      );
      if (c.shouldSms) await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-refill-sms", sent_at: targetDate },
        { onConflict: "client_id,action_type" }
      );

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

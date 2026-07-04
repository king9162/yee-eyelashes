import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin }     from "@/lib/supabase";
import { sendBirthdayEmail } from "@/lib/email";
import { sendSMS }           from "@/lib/sms";
import { todayNY, todayMMDD } from "@/lib/date";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const validTokens = [`Bearer ${process.env.CRON_SECRET}`, `Bearer ${process.env.ADMIN_SECRET_KEY}`];
  if (!validTokens.includes(authHeader ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const [{ data: emailSetting }, { data: smsSetting }] = await Promise.all([
    db.from("settings").select("value").eq("key", "birthday-email").maybeSingle(),
    db.from("settings").select("value").eq("key", "birthday-sms").maybeSingle(),
  ]);
  const emailOn = emailSetting?.value === "true";
  const smsOn   = smsSetting?.value === "true";
  if (!emailOn && !smsOn) return NextResponse.json({ skipped: true, reason: "disabled" });

  const today      = todayNY();
  const birthdayMD = todayMMDD(); // "MM/DD"

  const { data: birthdayClients, error } = await db
    .from("clients")
    .select("id, first_name, last_name, phone, email")
    .eq("birthday", birthdayMD)
    .not("deleted", "eq", true);

  if (error) {
    console.error("Birthday cron query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Per-channel dedup
  const [{ data: emailSentToday }, { data: smsSentToday }, { data: unsubActions }] = await Promise.all([
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-birthday-email", "birthday-email"])
      .eq("sent_at", today),
    db.from("client_actions").select("client_id")
      .in("action_type", ["auto-birthday-sms", "birthday-sms"])
      .eq("sent_at", today),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
  ]);
  const emailSentIds = new Set((emailSentToday ?? []).map(a => a.client_id));
  const smsSentIds   = new Set((smsSentToday  ?? []).map(a => a.client_id));
  const unsubIds     = new Set((unsubActions  ?? []).map(a => a.client_id));

  type EligibleClient = typeof birthdayClients extends (infer T)[] | null ? T & { shouldEmail: boolean; shouldSms: boolean } : never;
  const eligible: EligibleClient[] = (birthdayClients ?? []).flatMap(c => {
    const shouldEmail = emailOn && !!c.email && !emailSentIds.has(c.id);
    const shouldSms   = smsOn   && !!c.phone && !smsSentIds.has(c.id) && !unsubIds.has(c.id);
    if (!shouldEmail && !shouldSms) return [];
    return [{ ...c, shouldEmail, shouldSms }];
  });

  const bookUrl = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";
  const smsText = (name: string) =>
    `🎂 Happy Birthday, ${name}! Celebrate with gorgeous lashes, enjoy 20% off any service this month at Yee Eyelashes 🎁 Book: ${bookUrl} 📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  const results = await Promise.allSettled(
    eligible.map(async (c) => {
      const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.first_name;
      await Promise.all([
        c.shouldEmail
          ? sendBirthdayEmail({ name, email: c.email }).catch(e => console.error("Birthday email error:", e))
          : Promise.resolve(),
        c.shouldSms
          ? sendSMS(c.phone, smsText(name)).catch(e => console.error("Birthday SMS error:", e))
          : Promise.resolve(),
      ]);

      if (c.shouldEmail) await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-birthday-email", sent_at: today },
        { onConflict: "client_id,action_type" }
      );
      if (c.shouldSms) await db.from("client_actions").upsert(
        { client_id: c.id, action_type: "auto-birthday-sms", sent_at: today },
        { onConflict: "client_id,action_type" }
      );
    })
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, date: today, birthday: birthdayMD });
}

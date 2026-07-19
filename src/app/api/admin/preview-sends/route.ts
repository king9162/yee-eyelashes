import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY, offsetDateNY, todayMMDD } from "@/lib/date";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const today = todayNY();

  // Get settings
  const { data: settingsRows } = await db.from("settings").select("key, value");
  const settings = Object.fromEntries((settingsRows ?? []).map(r => [r.key, r.value]));
  const reviewEmailOn  = settings["review-email"]  !== "false";
  const reviewSmsOn    = settings["review-sms"]    === "true";
  const refillEmailOn  = settings["refill-email"]  !== "false";
  const refillSmsOn    = settings["refill-sms"]    === "true";
  const bdayEmailOn    = settings["birthday-email"] === "true";
  const bdaySmsOn      = settings["birthday-sms"]   === "true";
  const refillDays     = Math.max(1, parseInt(settings["refill_days"] ?? "14") || 14);
  const refillTarget   = offsetDateNY(today, -refillDays);
  const birthdayMD     = todayMMDD();

  // Fetch all needed data in parallel
  const [
    { data: reviewClients },
    { data: refillClients },
    { data: bdayClients },
    { data: noReviewActions },
    { data: noRefillActions },
    { data: reviewEmailSent },
    { data: reviewSmsSent },
    { data: refillEmailSent },
    { data: refillSmsSent },
    { data: bdayEmailSent },
    { data: bdaySmsSent },
    { data: upcoming },
    { data: cancelledRefill },
    { data: cancelledReview },
    { data: manualRefillEmail },
    { data: manualRefillSms },
    { data: unsubActions },
    { data: blockedActions },
  ] = await Promise.all([
    db.from("clients").select("id, first_name, last_name, phone, email").eq("visit_date", today).not("deleted","eq",true),
    db.from("clients").select("id, first_name, last_name, phone, email").eq("visit_date", refillTarget).not("deleted","eq",true),
    db.from("clients").select("id, first_name, last_name, phone, email, birthday").eq("birthday", birthdayMD).not("deleted","eq",true),
    db.from("client_actions").select("client_id").eq("action_type", "no-review"),
    db.from("client_actions").select("client_id").eq("action_type", "no-refill"),
    db.from("client_actions").select("client_id").in("action_type",["auto-review-email","auto-review","review-email"]).eq("sent_at", today),
    db.from("client_actions").select("client_id").in("action_type",["auto-review-sms","auto-review","review-sms"]).eq("sent_at", today),
    db.from("client_actions").select("client_id").in("action_type",["auto-refill-email","auto-refill"]).eq("sent_at", refillTarget),
    db.from("client_actions").select("client_id").in("action_type",["auto-refill-sms","auto-refill"]).eq("sent_at", refillTarget),
    db.from("client_actions").select("client_id").in("action_type",["auto-birthday-email","birthday-email"]).eq("sent_at", today),
    db.from("client_actions").select("client_id").in("action_type",["auto-birthday-sms","birthday-sms"]).eq("sent_at", today),
    db.from("bookings").select("phone, email").gte("date", today).lte("date", offsetDateNY(today, 14)).neq("status","cancelled"),
    // Cancelled on refill target date → skip from refill
    db.from("bookings").select("phone, email").eq("date", refillTarget).eq("status","cancelled"),
    // Cancelled today → skip from review
    db.from("bookings").select("phone, email").eq("date", today).eq("status","cancelled"),
    // Manual refill sends
    db.from("client_actions").select("client_id").eq("action_type","refill-email").gte("sent_at", refillTarget),
    db.from("client_actions").select("client_id").eq("action_type","refill-sms").gte("sent_at", refillTarget),
    db.from("client_actions").select("client_id").eq("action_type","sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type","blocked"),
  ]);

  const noReviewIds        = new Set((noReviewActions  ?? []).map(a => a.client_id));
  const noRefillIds        = new Set((noRefillActions  ?? []).map(a => a.client_id));
  const reviewEmailSentIds = new Set((reviewEmailSent  ?? []).map(a => a.client_id));
  const reviewSmsSentIds   = new Set((reviewSmsSent    ?? []).map(a => a.client_id));
  const refillEmailSentIds = new Set((refillEmailSent  ?? []).map(a => a.client_id));
  const refillSmsSentIds   = new Set((refillSmsSent    ?? []).map(a => a.client_id));
  const bdayEmailSentIds   = new Set((bdayEmailSent    ?? []).map(a => a.client_id));
  const bdaySmsSentIds     = new Set((bdaySmsSent      ?? []).map(a => a.client_id));
  const unsubIds           = new Set((unsubActions     ?? []).map(a => a.client_id));

  const blockedClientIds   = new Set((blockedActions   ?? []).map(a => a.client_id));
  // Resolve blocked client IDs → phone digits for cross-row blocking
  const blockedPhoneSet    = new Set<string>();
  if (blockedClientIds.size > 0) {
    const { data: bClients } = await db.from("clients").select("phone").in("id", [...blockedClientIds]);
    for (const bc of bClients ?? []) {
      const ph = (bc.phone ?? "").replace(/\D/g, "").slice(-10);
      if (ph) blockedPhoneSet.add(ph);
    }
  }

  (manualRefillEmail ?? []).forEach(a => refillEmailSentIds.add(a.client_id));
  (manualRefillSms   ?? []).forEach(a => refillSmsSentIds.add(a.client_id));

  const upcomingPhones = new Set((upcoming ?? []).map(b => b.phone?.replace(/\D/g,"").slice(-10)).filter(Boolean));
  const upcomingEmails = new Set((upcoming ?? []).map(b => b.email).filter(Boolean));

  const cancelledRefillPhones = new Set((cancelledRefill ?? []).map(b => b.phone?.replace(/\D/g,"").slice(-10)).filter(Boolean));
  const cancelledRefillEmails = new Set((cancelledRefill ?? []).map(b => b.email).filter(Boolean));
  const cancelledReviewPhones = new Set((cancelledReview ?? []).map(b => b.phone?.replace(/\D/g,"").slice(-10)).filter(Boolean));
  const cancelledReviewEmails = new Set((cancelledReview ?? []).map(b => b.email).filter(Boolean));

  // Deduplicate helpers — same grouping logic as My Clients
  function dedup<T extends { phone?: string; email?: string }>(arr: T[]): T[] {
    const phones = new Set<string>(); const emails = new Set<string>();
    return arr.filter(c => {
      const ph = c.phone?.replace(/\D/g,"").slice(-10);
      if (ph && phones.has(ph)) return false;
      if (c.email && emails.has(c.email)) return false;
      if (ph) phones.add(ph);
      if (c.email) emails.add(c.email);
      return true;
    });
  }

  type ClientRow = { id: string; first_name: string; last_name: string; phone: string; email: string; channels: string[] };

  const review: ClientRow[] = dedup(reviewClients ?? []).flatMap(c => {
    if (!`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()) return [];
    if (noReviewIds.has(c.id)) return [];
    const phone = c.phone?.replace(/\D/g,"").slice(-10);
    if (phone && blockedPhoneSet.has(phone)) return [];
    if ((phone && cancelledReviewPhones.has(phone)) || (c.email && cancelledReviewEmails.has(c.email))) return [];
    const channels: string[] = [];
    if (reviewEmailOn && c.email && !reviewEmailSentIds.has(c.id)) channels.push("email");
    if (reviewSmsOn   && c.phone && !reviewSmsSentIds.has(c.id) && !unsubIds.has(c.id)) channels.push("sms");
    if (!channels.length) return [];
    return [{ id: c.id, first_name: c.first_name, last_name: c.last_name, phone: c.phone, email: c.email, channels }];
  });

  const refill: ClientRow[] = dedup(refillClients ?? []).flatMap(c => {
    if (!`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()) return [];
    if (noRefillIds.has(c.id)) return [];
    const phone = c.phone?.replace(/\D/g,"").slice(-10);
    if (phone && blockedPhoneSet.has(phone)) return [];
    if ((phone && cancelledRefillPhones.has(phone)) || (c.email && cancelledRefillEmails.has(c.email))) return [];
    if ((phone && upcomingPhones.has(phone)) || (c.email && upcomingEmails.has(c.email))) return [];
    const channels: string[] = [];
    if (refillEmailOn && c.email && !refillEmailSentIds.has(c.id)) channels.push("email");
    if (refillSmsOn   && c.phone && !refillSmsSentIds.has(c.id) && !unsubIds.has(c.id)) channels.push("sms");
    if (!channels.length) return [];
    return [{ id: c.id, first_name: c.first_name, last_name: c.last_name, phone: c.phone, email: c.email, channels }];
  });

  const birthday: ClientRow[] = dedup(bdayClients ?? []).flatMap(c => {
    const phone = c.phone?.replace(/\D/g,"").slice(-10);
    if (phone && blockedPhoneSet.has(phone)) return [];
    const channels: string[] = [];
    if (bdayEmailOn && c.email && !bdayEmailSentIds.has(c.id)) channels.push("email");
    if (bdaySmsOn   && c.phone && !bdaySmsSentIds.has(c.id) && !unsubIds.has(c.id)) channels.push("sms");
    if (!channels.length) return [];
    return [{ id: c.id, first_name: c.first_name, last_name: c.last_name, phone: c.phone, email: c.email, channels }];
  });

  return NextResponse.json({ review, refill, birthday, date: today, refillTarget, birthdayMD });
}

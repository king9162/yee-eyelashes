import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSMS }       from "@/lib/sms";
import { todayNY }       from "@/lib/date";

export const dynamic = "force-dynamic";

function auth(req: NextRequest) {
  return (req.headers.get("Authorization") ?? "") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

function normPhone(p: string) {
  return p?.replace(/\D/g, "").slice(-10) ?? "";
}

type RawClient = {
  id: string; first_name: string; last_name: string;
  phone: string; email: string; visit_date: string;
};

type BlastClient = {
  id: string; first_name: string; last_name: string;
  phone: string; latestVisit: string;
};

/**
 * Build the eligible client list matching My Clients ordering:
 * - Group rows by phone (deduplicate)
 * - Find latest NON-cancelled visit date per group
 * - Exclude groups with no non-cancelled visits
 * - Sort by that date descending (same as My Clients)
 * - Exclude unsubscribed and already-sent-today clients
 */
function buildBlastList(
  allClients: RawClient[],
  cancelledMap: Map<string, Set<string>>,
  unsubPhones: Set<string>,
  alreadySentPhones: Set<string>
): BlastClient[] {
  // Group by phone → collect all visit dates + pick best representative row
  const grouped = new Map<string, {
    id: string; first_name: string; last_name: string;
    phone: string; visitDates: string[];
  }>();

  for (const c of allClients) {
    const ph = normPhone(c.phone ?? "");
    if (!ph) continue;
    if (!grouped.has(ph)) {
      grouped.set(ph, {
        id: c.id, first_name: c.first_name, last_name: c.last_name,
        phone: c.phone, visitDates: [],
      });
    }
    const g = grouped.get(ph)!;
    // Merge name — same as My Clients: fill in missing fields from later rows
    if (!g.first_name && c.first_name) g.first_name = c.first_name;
    if (!g.last_name  && c.last_name)  g.last_name  = c.last_name;
    if (c.visit_date) g.visitDates.push(c.visit_date);
  }

  return Array.from(grouped.values())
    .map(g => {
      const ph = normPhone(g.phone);
      const cancelled = cancelledMap.get(ph) ?? new Set<string>();
      const latestVisit = g.visitDates
        .filter(d => d && !cancelled.has(d))
        .sort().at(-1) ?? "";
      return { ...g, latestVisit };
    })
    .filter(g => {
      if (!g.latestVisit) return false;            // only cancelled visits → skip
      if (!`${g.first_name ?? ""} ${g.last_name ?? ""}`.trim()) return false; // no name → skip
      const ph = normPhone(g.phone);
      if (unsubPhones.has(ph)) return false;       // unsubscribed
      if (alreadySentPhones.has(ph)) return false; // already sent today
      return true;
    })
    .sort((a, b) => b.latestVisit.localeCompare(a.latestVisit))
    .map(({ visitDates, ...c }) => c);
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();

  const [
    { data: rawClients },
    { data: cancelledBookings },
    { data: unsubActions },
    { data: alreadySent },
  ] = await Promise.all([
    db.from("clients")
      .select("id, first_name, last_name, phone, email, visit_date")
      .not("deleted", "eq", true)
      .not("phone",  "is", null)
      .neq("owner", "elly"),
    db.from("bookings").select("phone, date").eq("status", "cancelled"),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  // Build cancelled dates map: normalizedPhone → Set<date>
  const cancelledMap = new Map<string, Set<string>>();
  for (const b of cancelledBookings ?? []) {
    const ph = normPhone(b.phone ?? "");
    if (!ph || !b.date) continue;
    if (!cancelledMap.has(ph)) cancelledMap.set(ph, new Set());
    cancelledMap.get(ph)!.add(b.date);
  }

  // Build lookup: clientId → phone for unsub / already-sent checks
  const idToPhone = new Map<string, string>(
    (rawClients ?? []).map(c => [c.id, normPhone(c.phone ?? "")])
  );
  const unsubPhones      = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const alreadySentPhones = new Set((alreadySent ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  const clients = buildBlastList(
    (rawClients ?? []) as RawClient[],
    cancelledMap,
    unsubPhones,
    alreadySentPhones
  );

  return NextResponse.json({ clients, date: today });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, clientIds } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db    = supabaseAdmin();
  const today = todayNY();

  const [
    { data: rawClients },
    { data: cancelledBookings },
    { data: unsubActions },
    { data: alreadySent },
  ] = await Promise.all([
    db.from("clients")
      .select("id, first_name, last_name, phone, email, visit_date")
      .not("deleted", "eq", true)
      .not("phone",  "is", null)
      .neq("owner", "elly"),
    db.from("bookings").select("phone, date").eq("status", "cancelled"),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const cancelledMap = new Map<string, Set<string>>();
  for (const b of cancelledBookings ?? []) {
    const ph = normPhone(b.phone ?? "");
    if (!ph || !b.date) continue;
    if (!cancelledMap.has(ph)) cancelledMap.set(ph, new Set());
    cancelledMap.get(ph)!.add(b.date);
  }

  const idToPhone = new Map<string, string>(
    (rawClients ?? []).map(c => [c.id, normPhone(c.phone ?? "")])
  );
  const unsubPhones       = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const alreadySentPhones = new Set((alreadySent ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  let clients = buildBlastList(
    (rawClients ?? []) as RawClient[],
    cancelledMap,
    unsubPhones,
    alreadySentPhones
  );

  // Filter to caller-selected IDs if provided
  if (Array.isArray(clientIds) && clientIds.length > 0) {
    const allowed = new Set<string>(clientIds);
    clients = clients.filter(c => allowed.has(c.id));
  }

  const results = await Promise.allSettled(
    clients.map(async (c) => {
      const digits = c.phone.replace(/\D/g, "");
      const e164   = digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
      await sendSMS(e164, message);
      await db.from("client_actions").insert({
        client_id:   c.id,
        action_type: "holiday-blast-sms",
        sent_at:     today,
      });
    })
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;
  return NextResponse.json({ sent, failed });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSMS }       from "@/lib/sms";
import { todayNY }       from "@/lib/date";

export const dynamic = "force-dynamic";

function auth(req: NextRequest) {
  return (req.headers.get("Authorization") ?? "") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

function normPhone(p: string | null | undefined) {
  return (p ?? "").replace(/\D/g, "").slice(-10);
}

function isRealName(n: string | null | undefined) {
  const s = (n ?? "").trim().toLowerCase();
  return s !== "" && s !== "unknown" && s !== "null" && s !== "undefined";
}

type RawClient = {
  id: string; first_name: string | null; last_name: string | null;
  phone: string; visit_date: string | null;
};

async function fetchData(db: ReturnType<typeof supabaseAdmin>, today: string) {
  const [
    { data: rawRows },
    { data: cancelledBookings },
    { data: unsubActions },
    { data: alreadySent },
  ] = await Promise.all([
    // Same as My Clients: all rows, owner != elly, not deleted, has phone
    db.from("clients")
      .select("id, first_name, last_name, phone, visit_date")
      .not("deleted",  "eq", true)
      .not("phone",    "is", null)
      .neq("owner", "elly"),

    // Need cancelled dates to exclude cancelled-only clients (same as My Clients logic)
    db.from("bookings").select("phone, date").eq("status", "cancelled"),

    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const rows = (rawRows ?? []) as RawClient[];

  // Build cancelled dates map: normalizedPhone → Set<visitDate>
  const cancelledMap = new Map<string, Set<string>>();
  for (const b of cancelledBookings ?? []) {
    const ph = normPhone(b.phone ?? "");
    if (!ph || !b.date) continue;
    if (!cancelledMap.has(ph)) cancelledMap.set(ph, new Set());
    cancelledMap.get(ph)!.add(b.date);
  }

  const idToPhone     = new Map(rows.map(c => [c.id, normPhone(c.phone)]));
  const unsubPhones   = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const sentPhones    = new Set((alreadySent  ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  return { rows, cancelledMap, unsubPhones, sentPhones };
}

function buildList(
  rows: RawClient[],
  cancelledMap: Map<string, Set<string>>,
  unsubPhones: Set<string>,
  sentPhones: Set<string>,
) {
  // Group by phone — same as My Clients
  type Group = { id: string; first_name: string; last_name: string; phone: string; visitDates: string[] };
  const grouped = new Map<string, Group>();

  for (const c of rows) {
    const ph = normPhone(c.phone);
    if (!ph) continue;

    if (!grouped.has(ph)) {
      grouped.set(ph, {
        id: c.id,
        first_name: (c.first_name ?? "").trim(),
        last_name:  (c.last_name  ?? "").trim(),
        phone: c.phone,
        visitDates: [],
      });
    }
    const g = grouped.get(ph)!;

    // Prefer real names over Unknown/empty when merging rows
    if (!isRealName(g.first_name) && isRealName(c.first_name)) g.first_name = (c.first_name ?? "").trim();
    if (!isRealName(g.last_name)  && isRealName(c.last_name))  g.last_name  = (c.last_name  ?? "").trim();

    if (c.visit_date) g.visitDates.push(c.visit_date);
  }

  return Array.from(grouped.values())
    .filter(g => {
      // Must have a real name
      if (!isRealName(g.first_name) && !isRealName(g.last_name)) return false;

      // Must have at least one non-cancelled visit (same rule as My Clients A-Z non-cancelled sort)
      const cancelled = cancelledMap.get(normPhone(g.phone)) ?? new Set<string>();
      const hasRealVisit = g.visitDates.some(d => d && !cancelled.has(d));
      if (!hasRealVisit) return false;

      // Skip unsubscribed / already sent today
      const ph = normPhone(g.phone);
      if (unsubPhones.has(ph)) return false;
      if (sentPhones.has(ph))  return false;

      return true;
    })
    .sort((a, b) =>
      a.first_name.localeCompare(b.first_name) ||
      a.last_name.localeCompare(b.last_name)
    )
    .map(({ visitDates, ...c }) => c);
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const { rows, cancelledMap, unsubPhones, sentPhones } = await fetchData(db, today);
  const clients = buildList(rows, cancelledMap, unsubPhones, sentPhones);

  return NextResponse.json({ clients, date: today });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, clientIds } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const { rows, cancelledMap, unsubPhones, sentPhones } = await fetchData(db, today);
  let clients = buildList(rows, cancelledMap, unsubPhones, sentPhones);

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

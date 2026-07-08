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
  phone: string | null; owner: string | null; deleted: boolean | null;
};

async function fetchRows(db: ReturnType<typeof supabaseAdmin>) {
  const { data: rawRows } = await db.from("clients")
    .select("id, first_name, last_name, phone, owner, deleted");

  return (rawRows ?? [] as RawClient[]).filter(
    (c: RawClient) => c.owner !== "elly" && !c.deleted && c.phone
  ) as RawClient[];
}

function buildList(rows: RawClient[], excludePhones: Set<string>) {
  const grouped = new Map<string, { id: string; first_name: string; last_name: string; phone: string }>();

  for (const c of rows) {
    const ph = normPhone(c.phone);
    if (!ph) continue;

    if (!grouped.has(ph)) {
      grouped.set(ph, {
        id: c.id,
        first_name: (c.first_name ?? "").trim(),
        last_name:  (c.last_name  ?? "").trim(),
        phone: c.phone!,
      });
    }
    const g = grouped.get(ph)!;
    if (!isRealName(g.first_name) && isRealName(c.first_name)) g.first_name = (c.first_name ?? "").trim();
    if (!isRealName(g.last_name)  && isRealName(c.last_name))  g.last_name  = (c.last_name  ?? "").trim();
  }

  return Array.from(grouped.values())
    .filter(g => {
      if (!isRealName(g.first_name) && !isRealName(g.last_name)) return false;
      if (excludePhones.has(normPhone(g.phone))) return false;
      return true;
    })
    .sort((a, b) => {
      const nameA = (a.first_name || a.last_name).toUpperCase();
      const nameB = (b.first_name || b.last_name).toUpperCase();
      return nameA.localeCompare(nameB);
    });
}

async function getUnsubPhones(db: ReturnType<typeof supabaseAdmin>, rows: RawClient[]) {
  const { data: unsubActions } = await db.from("client_actions")
    .select("client_id").eq("action_type", "sms-unsubscribed");
  const idToPhone = new Map(rows.map(c => [c.id, normPhone(c.phone)]));
  return new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
}

async function getSentPhones(db: ReturnType<typeof supabaseAdmin>, rows: RawClient[], today: string) {
  const { data: alreadySent } = await db.from("client_actions")
    .select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today);
  const idToPhone = new Map(rows.map(c => [c.id, normPhone(c.phone)]));
  return new Set((alreadySent ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
}

// GET: show full My Clients list (only exclude unsubscribed, NOT already-sent-today)
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db   = supabaseAdmin();
  const rows = await fetchRows(db);
  const unsubPhones = await getUnsubPhones(db, rows);
  const clients = buildList(rows, unsubPhones);

  return NextResponse.json({ clients, date: todayNY() });
}

// POST: send only to those not yet sent today (prevents duplicate sends)
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, clientIds } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const rows  = await fetchRows(db);

  const unsubPhones = await getUnsubPhones(db, rows);
  const sentPhones  = await getSentPhones(db, rows, today);

  const { data: blockedActions } = await db.from("client_actions").select("client_id").eq("action_type", "blocked");
  const blockedPhones = new Set<string>();
  if ((blockedActions ?? []).length > 0) {
    const { data: bClients } = await db.from("clients").select("phone").in("id", blockedActions!.map(a => a.client_id));
    for (const bc of bClients ?? []) { const ph = (bc.phone ?? "").replace(/\D/g,"").slice(-10); if (ph) blockedPhones.add(ph); }
  }

  const excludePhones = new Set([...unsubPhones, ...sentPhones, ...blockedPhones]);

  let clients = buildList(rows, excludePhones);

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

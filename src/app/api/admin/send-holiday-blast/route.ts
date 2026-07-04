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

type RawClient = { id: string; first_name: string; last_name: string; phone: string };

/**
 * Same grouping as My Clients:
 * - Deduplicate by phone
 * - Merge names across rows (in case one row is nameless)
 * - Skip nameless groups
 * - Sort A-Z by first name
 */
function buildMyClientsList(
  allClients: RawClient[],
  unsubPhones: Set<string>,
  alreadySentPhones: Set<string>
) {
  const grouped = new Map<string, { id: string; first_name: string; last_name: string; phone: string }>();

  for (const c of allClients) {
    const ph = normPhone(c.phone ?? "");
    if (!ph) continue;
    if (!grouped.has(ph)) {
      grouped.set(ph, { id: c.id, first_name: c.first_name ?? "", last_name: c.last_name ?? "", phone: c.phone });
    }
    const g = grouped.get(ph)!;
    if (!g.first_name && c.first_name) g.first_name = c.first_name;
    if (!g.last_name  && c.last_name)  g.last_name  = c.last_name;
  }

  return Array.from(grouped.values())
    .filter(g => {
      if (!`${g.first_name} ${g.last_name}`.trim()) return false; // skip nameless
      if (unsubPhones.has(normPhone(g.phone))) return false;
      if (alreadySentPhones.has(normPhone(g.phone))) return false;
      return true;
    })
    .sort((a, b) =>
      (a.first_name ?? "").localeCompare(b.first_name ?? "") ||
      (a.last_name  ?? "").localeCompare(b.last_name  ?? "")
    );
}

async function fetchData(db: ReturnType<typeof supabaseAdmin>, today: string) {
  const [{ data: rawClients }, { data: unsubActions }, { data: alreadySent }] = await Promise.all([
    db.from("clients")
      .select("id, first_name, last_name, phone")
      .not("deleted", "eq", true)
      .not("phone",  "is", null)
      .neq("owner", "elly"),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const idToPhone      = new Map((rawClients ?? []).map(c => [c.id, normPhone(c.phone ?? "")]));
  const unsubPhones       = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const alreadySentPhones = new Set((alreadySent  ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  return { rawClients: (rawClients ?? []) as RawClient[], unsubPhones, alreadySentPhones };
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const { rawClients, unsubPhones, alreadySentPhones } = await fetchData(db, today);
  const clients = buildMyClientsList(rawClients, unsubPhones, alreadySentPhones);

  return NextResponse.json({ clients, date: today });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, clientIds } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const { rawClients, unsubPhones, alreadySentPhones } = await fetchData(db, today);
  let clients = buildMyClientsList(rawClients, unsubPhones, alreadySentPhones);

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

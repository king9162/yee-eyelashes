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

async function fetchData(db: ReturnType<typeof supabaseAdmin>, today: string) {
  const [
    { data: rawRows },
    { data: unsubActions },
    { data: alreadySent },
  ] = await Promise.all([
    // Fetch all — filter owner in JS exactly like My Clients does (c.owner !== "elly")
    db.from("clients")
      .select("id, first_name, last_name, phone, owner, deleted"),

    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  // Mirror My Clients JS filter exactly: owner !== "elly" and not deleted and has phone
  const rows = (rawRows ?? [] as RawClient[]).filter(
    (c: RawClient) => c.owner !== "elly" && !c.deleted && c.phone
  ) as RawClient[];

  const idToPhone   = new Map(rows.map(c => [c.id, normPhone(c.phone)]));
  const unsubPhones = new Set((unsubActions ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));
  const sentPhones  = new Set((alreadySent  ?? []).map(a => idToPhone.get(a.client_id) ?? "").filter(Boolean));

  return { rows, unsubPhones, sentPhones };
}

function buildList(
  rows: RawClient[],
  unsubPhones: Set<string>,
  sentPhones: Set<string>,
) {
  // Group by phone — same as My Clients
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

    // Prefer real names over Unknown/empty when merging rows
    if (!isRealName(g.first_name) && isRealName(c.first_name)) g.first_name = (c.first_name ?? "").trim();
    if (!isRealName(g.last_name)  && isRealName(c.last_name))  g.last_name  = (c.last_name  ?? "").trim();
  }

  return Array.from(grouped.values())
    .filter(g => {
      // Must have a real name
      if (!isRealName(g.first_name) && !isRealName(g.last_name)) return false;

      // Skip unsubscribed / already sent today
      const ph = normPhone(g.phone);
      if (unsubPhones.has(ph)) return false;
      if (sentPhones.has(ph))  return false;

      return true;
    })
    .sort((a, b) => {
      const nameA = (a.first_name || a.last_name).toUpperCase();
      const nameB = (b.first_name || b.last_name).toUpperCase();
      return nameA.localeCompare(nameB);
    });
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const { rows, unsubPhones, sentPhones } = await fetchData(db, today);
  const clients = buildList(rows, unsubPhones, sentPhones);

  return NextResponse.json({ clients, date: today });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, clientIds } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db    = supabaseAdmin();
  const today = todayNY();
  const { rows, unsubPhones, sentPhones } = await fetchData(db, today);
  let clients = buildList(rows, unsubPhones, sentPhones);

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

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSMS }       from "@/lib/sms";
import { todayNY }       from "@/lib/date";

export const dynamic = "force-dynamic";

function auth(req: NextRequest) {
  return (req.headers.get("Authorization") ?? "") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

type RawClient = { id: string; first_name: string; last_name: string; phone: string };

function eligibleClients(
  allClients: RawClient[],
  unsubIds: Set<string>,
  alreadySentIds: Set<string>
) {
  const seen = new Set<string>();
  return allClients.filter(c => {
    if (!c.phone) return false;
    if (unsubIds.has(c.id)) return false;
    if (alreadySentIds.has(c.id)) return false;
    const ph = c.phone.replace(/\D/g, "").slice(-10);
    if (!ph) return false;
    if (seen.has(ph)) return false;
    seen.add(ph);
    return true;
  });
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db    = supabaseAdmin();
  const today = todayNY();

  const [{ data: allClients }, { data: unsubActions }, { data: alreadySent }] = await Promise.all([
    db.from("clients").select("id, first_name, last_name, phone")
      .not("deleted", "eq", true).not("phone", "is", null).neq("owner", "elly")
      .order("first_name", { ascending: true }),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const unsubIds       = new Set((unsubActions ?? []).map(a => a.client_id));
  const alreadySentIds = new Set((alreadySent  ?? []).map(a => a.client_id));
  const clients        = eligibleClients((allClients ?? []) as RawClient[], unsubIds, alreadySentIds);

  return NextResponse.json({ clients, date: today });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, clientIds } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db    = supabaseAdmin();
  const today = todayNY();

  const [{ data: allClients }, { data: unsubActions }, { data: alreadySent }] = await Promise.all([
    db.from("clients").select("id, first_name, last_name, phone")
      .not("deleted", "eq", true).not("phone", "is", null).neq("owner", "elly"),
    db.from("client_actions").select("client_id").eq("action_type", "sms-unsubscribed"),
    db.from("client_actions").select("client_id").eq("action_type", "holiday-blast-sms").eq("sent_at", today),
  ]);

  const unsubIds       = new Set((unsubActions ?? []).map(a => a.client_id));
  const alreadySentIds = new Set((alreadySent  ?? []).map(a => a.client_id));
  let clients          = eligibleClients((allClients ?? []) as RawClient[], unsubIds, alreadySentIds);

  // If caller passed a specific list, filter to only those IDs
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

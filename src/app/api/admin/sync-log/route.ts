import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const KEY = "sync_log";
const MAX = 200;

export type SyncLogEntry = {
  ts: string;       // ISO timestamp
  type: "booking" | "client";
  name: string;
  sub: string;      // e.g. "2026-06-15 9:30 AM · Square Appointment"
};

async function readLog(db: ReturnType<typeof supabaseAdmin>): Promise<SyncLogEntry[]> {
  const { data } = await db.from("settings").select("value").eq("key", KEY).maybeSingle();
  if (!data?.value) return [];
  try { return JSON.parse(data.value) as SyncLogEntry[]; } catch { return []; }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  return NextResponse.json(await readLog(db));
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  await db.from("settings").upsert({ key: KEY, value: "[]" }, { onConflict: "key" });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db      = supabaseAdmin();
  const entries: SyncLogEntry[] = await req.json();
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ ok: true });
  }
  const existing = await readLog(db);
  const merged   = [...entries, ...existing].slice(0, MAX);
  await db.from("settings").upsert({ key: KEY, value: JSON.stringify(merged) }, { onConflict: "key" });
  return NextResponse.json({ ok: true, total: merged.length });
}

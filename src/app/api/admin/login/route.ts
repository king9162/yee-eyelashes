import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const MAX_ATTEMPTS = 10;
const LOCKOUT_MS   = 15 * 60 * 1000;

function ipKey(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  return "rl:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const db  = supabaseAdmin();
  const key = ipKey(req);

  // Check if this IP is locked out
  const { data: rl } = await db.from("settings").select("value").eq("key", key).maybeSingle();
  if (rl?.value) {
    const parsed = JSON.parse(rl.value) as { attempts: number; lockedUntil?: string };
    if (parsed.lockedUntil && new Date(parsed.lockedUntil) > new Date()) {
      const mins = Math.ceil((new Date(parsed.lockedUntil).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.` },
        { status: 429 }
      );
    }
  }

  // Get effective UI password: settings override, else env var
  const { data: pwRow } = await db.from("settings").select("value").eq("key", "ui_password").maybeSingle();
  const expectedPassword = pwRow?.value ?? process.env.ADMIN_SECRET_KEY ?? "";

  // Validate password
  if (password !== expectedPassword) {
    const prev = rl?.value
      ? (JSON.parse(rl.value) as { attempts: number })
      : { attempts: 0 };
    const attempts    = (prev.attempts || 0) + 1;
    const lockedUntil = attempts >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MS).toISOString()
      : undefined;
    await db.from("settings").upsert(
      { key, value: JSON.stringify({ attempts, lockedUntil }) },
      { onConflict: "key" }
    );
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  // Success — clear rate limit record
  if (rl) await db.from("settings").delete().eq("key", key);

  // Append login entry to log
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  const device = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Unknown";
  const entry = { at: new Date().toISOString(), ip: ip.split(".").slice(0, 2).join(".") + ".*.*", device };
  const { data: logRow } = await db.from("settings").select("value").eq("key", "admin_login_log").maybeSingle();
  const existing: typeof entry[] = logRow?.value ? JSON.parse(logRow.value) : [];
  const updated = [...existing, entry].slice(-20);
  await db.from("settings").upsert(
    { key: "admin_login_log", value: JSON.stringify(updated), updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  // Return the real API key so client always uses the correct Bearer token
  return NextResponse.json({ ok: true, adminKey: process.env.ADMIN_SECRET_KEY });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

// GET — return user names and whether a PIN is set (no PIN values)
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  const { data } = await db.from("settings").select("key, value")
    .in("key", ["user_1_name", "user_2_name", "user_1_pin", "user_2_pin"]);
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return NextResponse.json({
    user1: { name: map.user_1_name ?? "", hasPin: !!map.user_1_pin },
    user2: { name: map.user_2_name ?? "", hasPin: !!map.user_2_pin },
  });
}

// PATCH — set name and/or PIN for a user slot
// body: { slot: 1|2, name?: string, pin?: string, current_pin?: string }
// If the user already has a PIN and wants to change it, current_pin must match.
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slot, name, pin, current_pin } = await req.json();
  if (slot !== 1 && slot !== 2) return NextResponse.json({ error: "slot must be 1 or 2" }, { status: 400 });

  const db = supabaseAdmin();

  // If changing PIN, verify old PIN first
  if (pin !== undefined) {
    const { data: existing } = await db.from("settings")
      .select("value").eq("key", `user_${slot}_pin`).maybeSingle();
    const storedPin = existing?.value ?? "";
    if (storedPin && !current_pin) {
      return NextResponse.json({ error: "請輸入舊密碼" }, { status: 400 });
    }
    if (storedPin && String(current_pin).trim() !== storedPin) {
      return NextResponse.json({ error: "舊密碼錯誤" }, { status: 401 });
    }
  }

  const now = new Date().toISOString();
  const upserts: { key: string; value: string; updated_at: string }[] = [];
  if (name !== undefined) upserts.push({ key: `user_${slot}_name`, value: String(name).trim(), updated_at: now });
  if (pin  !== undefined) upserts.push({ key: `user_${slot}_pin`,  value: String(pin).trim(),  updated_at: now });
  if (upserts.length === 0) return NextResponse.json({ ok: true });
  const { error } = await db.from("settings").upsert(upserts, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

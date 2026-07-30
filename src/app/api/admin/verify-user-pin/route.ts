import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

// POST { pin } → { name } if PIN matches a user, else 401
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });

  const db = supabaseAdmin();
  const { data } = await db.from("settings").select("key, value")
    .in("key", ["user_1_name", "user_1_pin", "user_2_name", "user_2_pin"]);
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));

  const pinStr = String(pin).trim();
  if (map.user_1_pin && map.user_1_pin === pinStr && map.user_1_name) {
    return NextResponse.json({ name: map.user_1_name });
  }
  if (map.user_2_pin && map.user_2_pin === pinStr && map.user_2_name) {
    return NextResponse.json({ name: map.user_2_name });
  }
  return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
}

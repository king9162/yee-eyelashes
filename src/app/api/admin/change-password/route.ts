import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const MANAGER_PIN = process.env.MANAGER_PIN ?? "0219";

export async function POST(req: NextRequest) {
  const { currentPassword, newPassword, adminPin } = await req.json();

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: "新密碼至少需要 4 個字元" }, { status: 400 });
  }

  // Verify manager PIN first
  if (adminPin !== MANAGER_PIN) {
    return NextResponse.json({ error: "管理者密碼錯誤" }, { status: 401 });
  }

  // Get current effective password
  const db = supabaseAdmin();
  const { data: pwRow } = await db.from("settings").select("value").eq("key", "ui_password").maybeSingle();
  const currentEffective = pwRow?.value ?? process.env.ADMIN_SECRET_KEY ?? "";

  if (currentPassword !== currentEffective) {
    return NextResponse.json({ error: "目前密碼錯誤" }, { status: 401 });
  }

  // Save new UI password
  await db.from("settings").upsert(
    { key: "ui_password", value: newPassword, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  return NextResponse.json({ ok: true });
}

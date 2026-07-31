import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyResetToken } from "@/lib/resetToken";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const userId = verifyResetToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Reset link has expired or is invalid. Please request a new one." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db.auth.admin.updateUserById(userId, { password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

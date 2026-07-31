import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { linkMemberBookings } from "@/lib/linkMemberBookings";
import crypto from "crypto";

function verifyOtp(phone: string, code: string, token: string): boolean {
  const secret = process.env.OTP_SECRET ?? process.env.ADMIN_SECRET_KEY ?? "";
  const now = Math.floor(Date.now() / (10 * 60 * 1000));
  for (const w of [now, now - 1]) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${phone}:${code}:${w}`)
      .digest("hex");
    if (expected === token) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const { phone, password, birthday, first_name, last_name, email, otp_code, otp_token } = await req.json();

  const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return NextResponse.json({ error: "Please enter a valid 10-digit US phone number." }, { status: 400 });
  }

  if (!otp_code || !otp_token || !verifyOtp(digits, otp_code, otp_token)) {
    return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!first_name?.trim()) {
    return NextResponse.json({ error: "First name is required." }, { status: 400 });
  }

  const syntheticEmail = `p${digits}@yee.member`;
  const db = supabaseAdmin();

  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email: syntheticEmail,
    password,
    email_confirm: true,
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("exists")) {
      return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;
  const phoneE164 = `+1${digits}`;

  const { error: profileError } = await db.from("profiles").insert({
    id: userId,
    first_name: first_name.trim(),
    last_name: (last_name ?? "").trim(),
    email: (email ?? "").trim(),
    phone: phoneE164,
    birthday: birthday || null,
  });

  if (profileError) {
    await db.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Auto-sync name/email to matching client record by phone
  const updateFields: Record<string, string> = { first_name: first_name.trim() };
  if ((last_name ?? "").trim()) updateFields.last_name = last_name.trim();
  if ((email ?? "").trim()) updateFields.email = (email ?? "").trim();

  await db.from("clients").update(updateFields).ilike("phone", `%${digits}`);

  // Auto-link any existing Square bookings to this new member
  const realEmail = (email ?? "").trim() || null;
  await linkMemberBookings(db, userId, phoneE164, realEmail);

  return NextResponse.json({ ok: true });
}

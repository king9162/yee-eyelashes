import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { sendSMS } from "@/lib/sms";
import { buildResetEmailHtml } from "../phone-forgot-password/route";
import { generateResetToken } from "@/lib/resetToken";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yeeeyelashes.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();

  // Find profile with this real email
  const { data: profile } = await db
    .from("profiles")
    .select("id, first_name, phone")
    .eq("email", normalizedEmail)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    return NextResponse.json({ ok: true, sentEmail: false, sentSMS: false });
  }

  // Generate custom reset token — direct link, no Supabase redirect needed
  const token = generateResetToken(profile.id);
  const resetLink = `${SITE}/member/reset-password?token=${token}`;
  const firstName = profile?.first_name ?? "there";

  // Send email
  const resend = new Resend(process.env.RESEND_API_KEY ?? "");
  await resend.emails.send({
    from: "Yee Eyelashes <noreply@yeeeyelashes.com>",
    to: normalizedEmail,
    subject: "Reset your Yee Eyelashes password",
    html: buildResetEmailHtml(firstName, resetLink),
  });

  // Also send SMS if phone on file
  if (profile.phone) {
    const phoneE164 = profile.phone.startsWith("+") ? profile.phone : `+1${profile.phone.replace(/\D/g, "").slice(-10)}`;
    try {
      await sendSMS(phoneE164, `Yee Eyelashes: Reset your password here → ${resetLink}  (link expires in 1 hour)`);
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({ ok: true, sentEmail: true, sentSMS: !!profile.phone });
}

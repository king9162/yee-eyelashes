import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { sendSMS } from "@/lib/sms";
import { buildResetEmailHtml } from "../phone-forgot-password/route";

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
    return NextResponse.json({ ok: true });
  }

  // Get auth user to find their auth email (may be synthetic)
  const { data: { user } } = await db.auth.admin.getUserById(profile.id);
  const authEmail = user?.email;
  if (!authEmail) return NextResponse.json({ ok: true });

  // Generate recovery link
  const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
    type: "recovery",
    email: authEmail,
    options: { redirectTo: `${SITE}/member/reset-password` },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "Failed to generate reset link." }, { status: 500 });
  }

  const resetLink = linkData.properties.action_link;
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

  return NextResponse.json({ ok: true });
}

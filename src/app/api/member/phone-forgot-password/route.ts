import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { sendSMS } from "@/lib/sms";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yeeeyelashes.com";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  const syntheticEmail = `p${digits}@yee.member`;
  const db = supabaseAdmin();

  // Find auth user by synthetic email
  let userId: string | null = null;
  try {
    const { data: { users: allUsers } } = await db.auth.admin.listUsers({ perPage: 1000 });
    const match = allUsers.find(u => u.email === syntheticEmail);
    if (match) userId = match.id;
  } catch { /* non-fatal */ }

  if (!userId) {
    return NextResponse.json({ ok: true, hasEmail: false });
  }

  // Get profile
  const { data: profile } = await db
    .from("profiles")
    .select("email, first_name, phone")
    .eq("id", userId)
    .single();

  const realEmail = profile?.email?.trim();
  const profilePhone = profile?.phone?.trim();
  const firstName = profile?.first_name ?? "there";

  // Generate Supabase recovery link
  const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
    type: "recovery",
    email: syntheticEmail,
    options: { redirectTo: `${SITE}/member/auth/callback?type=recovery` },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "Failed to generate reset link." }, { status: 500 });
  }

  const resetLink = linkData.properties.action_link;

  // Send email if real email on file
  const hasEmail = !!(realEmail && realEmail !== syntheticEmail);
  if (hasEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY ?? "");
    const html = buildResetEmailHtml(firstName, resetLink);
    await resend.emails.send({
      from: "Yee Eyelashes <noreply@yeeeyelashes.com>",
      to: realEmail!,
      subject: "Reset your Yee Eyelashes password",
      html,
    });
  }

  // Send SMS if phone on file (always true when entering phone, but be safe)
  if (profilePhone) {
    const phoneE164 = profilePhone.startsWith("+") ? profilePhone : `+1${profilePhone.replace(/\D/g, "").slice(-10)}`;
    try {
      await sendSMS(phoneE164, `Yee Eyelashes: Reset your password here → ${resetLink}  (link expires in 1 hour)`);
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({ ok: true, hasEmail });
}

export function buildResetEmailHtml(firstName: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F5EF;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5EF;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
        <tr><td style="background:#1C1C1C;padding:6px 0;text-align:center;">
          <div style="width:40px;height:3px;background:#C9A84C;margin:0 auto;border-radius:2px;"></div>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;color:#C9A84C;text-transform:uppercase;">Yee Eyelashes Member Club</p>
          <h1 style="margin:0 0 20px;font-size:28px;font-weight:300;color:#1C1C1C;">Reset Your Password</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">Hi ${firstName},</p>
          <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
            We received a request to reset your Yee Eyelashes Member Club password. Click the button below to set a new password.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${resetLink}" style="display:inline-block;background:#1C1C1C;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:13px;font-weight:600;letter-spacing:0.05em;">Reset Password</a>
          </div>
          <p style="margin:0 0 8px;font-size:12px;color:#999;line-height:1.6;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="margin:0;font-size:12px;color:#bbb;">Or copy this link: <a href="${resetLink}" style="color:#C9A84C;word-break:break-all;">${resetLink}</a></p>
        </td></tr>
        <tr><td style="background:#F8F5EF;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#aaa;">Yee Eyelashes · Manhasset, NY</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

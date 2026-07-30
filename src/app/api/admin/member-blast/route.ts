import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

const FROM = "booking@yeeeyelashes.com";
const BASE = "https://www.yeeeyelashes.com";

async function listAllUsers(db: ReturnType<typeof supabaseAdmin>) {
  const result = new Map<string, string>(); // id -> email
  let page = 1;
  while (true) {
    const { data } = await db.auth.admin.listUsers({ perPage: 1000, page });
    for (const u of data?.users ?? []) {
      if (u.email) result.set(u.id, u.email);
    }
    if (!data?.users?.length || data.users.length < 1000) break;
    page++;
  }
  return result;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, html_body, preview_only } = await req.json();
  if (!subject || !html_body) {
    return NextResponse.json({ error: "subject and html_body required" }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: profiles } = await db
    .from("profiles")
    .select("id, first_name")
    .eq("notif_marketing", true)
    .not("referral_code", "is", null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, total: 0, preview_only: !!preview_only });
  }

  if (preview_only) {
    return NextResponse.json({
      sent: 0,
      total: profiles.length,
      preview_only: true,
      recipients: profiles.map(p => p.first_name ?? "Member"),
    });
  }

  const idToEmail = await listAllUsers(db);

  const resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");
  let sent = 0;
  const errors: string[] = [];

  for (const p of profiles) {
    const memberId = p.id as string;
    const email = idToEmail.get(memberId);
    if (!email) continue;

    const name = p.first_name ?? "Member";
    const unsubToken = generateUnsubscribeToken(memberId);
    const unsubUrl   = `${BASE}/member/unsubscribe?id=${memberId}&sig=${unsubToken}`;
    const profileUrl = `${BASE}/member/profile`;

    const footer = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e8e4dc;">
  <tr><td style="padding:20px;text-align:center;background:#1c1c1c;">
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">
      © ${new Date().getFullYear()} Yee Eyelashes · Manhasset, NY
    </p>
    <p style="margin:0;font-size:10px;color:#444;">
      <a href="${profileUrl}" style="color:#888;text-decoration:underline;">Manage notifications</a>
      &nbsp;·&nbsp;
      <a href="${unsubUrl}" style="color:#888;text-decoration:underline;">Unsubscribe</a>
    </p>
  </td></tr>
</table>`;

    const personalized = html_body
      .replace(/\{\{name\}\}/g, name)
      + footer;

    try {
      const { error } = await resend.emails.send({
        from: `Yee Eyelashes <${FROM}>`,
        to: email,
        subject,
        html: personalized,
      });
      if (error) errors.push(`${email}: ${JSON.stringify(error)}`);
      else sent++;
    } catch (e) {
      errors.push(`${email}: ${e}`);
    }
  }

  return NextResponse.json({ sent, total: profiles.length, errors: errors.slice(0, 10) });
}

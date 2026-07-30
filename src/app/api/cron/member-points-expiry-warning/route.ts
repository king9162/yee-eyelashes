import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendMemberPointsExpiryWarningEmail } from "@/lib/email";

function auth(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  return key === process.env.ADMIN_SECRET_KEY || key === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();

  // Points earned more than 11 months ago will expire on the 1st of next month
  const warnCutoff = new Date();
  warnCutoff.setMonth(warnCutoff.getMonth() - 11);

  // Compute the 1st of next month as the expiry date label
  const now = new Date();
  const expiryDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const expiryLabel = expiryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Find members with positive balance
  const { data: members } = await db
    .from("profiles")
    .select("id, first_name, points_balance")
    .gt("points_balance", 0);

  if (!members?.length) return NextResponse.json({ warned: 0 });

  // Get emails for all members
  const idToEmail = new Map<string, string>();
  let page = 1;
  while (true) {
    const { data } = await db.auth.admin.listUsers({ perPage: 1000, page });
    for (const u of data?.users ?? []) {
      if (u.email) idToEmail.set(u.id, u.email);
    }
    if (!data?.users?.length || data.users.length < 1000) break;
    page++;
  }

  let warned = 0;
  const errors: string[] = [];

  for (const member of members) {
    const memberId = member.id as string;
    const email = idToEmail.get(memberId);
    if (!email) continue;

    // Find points earned before warnCutoff not yet individually expired
    const { data: oldEarned } = await db
      .from("points_transactions")
      .select("amount")
      .eq("member_id", memberId)
      .in("type", ["purchase_earned", "promotion_bonus", "birthday_bonus", "referral_reward", "referral_bonus"])
      .gt("amount", 0)
      .lt("created_at", warnCutoff.toISOString());

    const { data: alreadyExpired } = await db
      .from("points_transactions")
      .select("amount")
      .eq("member_id", memberId)
      .eq("type", "expired");

    const earned = (oldEarned ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0);
    const expired = (alreadyExpired ?? []).reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount), 0);
    const expiringPts = Math.max(0, earned - expired);

    if (expiringPts <= 0) continue;

    try {
      await sendMemberPointsExpiryWarningEmail({
        name:           member.first_name ?? "Member",
        email,
        expiringPts,
        expiryDate:     expiryLabel,
        currentBalance: member.points_balance as number,
        memberId,
      });
      warned++;
    } catch (e) {
      errors.push(`${email}: ${e}`);
    }
  }

  return NextResponse.json({ warned, errors: errors.slice(0, 10) });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  // Find all 'purchase_earned' and 'promotion_bonus' transactions older than 1 year
  // that have a positive amount and haven't been individually expired
  const { data: members } = await db
    .from("profiles")
    .select("id, points_balance")
    .gt("points_balance", 0);

  if (!members || members.length === 0) {
    return NextResponse.json({ expired: 0, members_affected: 0 });
  }

  let totalExpired = 0;
  let membersAffected = 0;

  for (const member of members) {
    // Sum of points earned before the cutoff that are still "active"
    const { data: oldEarned } = await db
      .from("points_transactions")
      .select("amount")
      .eq("member_id", member.id)
      .in("type", ["purchase_earned", "promotion_bonus", "birthday_bonus", "referral_reward"])
      .gt("amount", 0)
      .lt("created_at", cutoff.toISOString());

    const { data: oldExpired } = await db
      .from("points_transactions")
      .select("amount")
      .eq("member_id", member.id)
      .eq("type", "expired")
      .lt("created_at", new Date().toISOString());

    const earned = (oldEarned ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0);
    const alreadyExpired = (oldExpired ?? []).reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount), 0);

    const toExpire = Math.max(0, earned - alreadyExpired);
    if (toExpire === 0) continue;

    const expireAmt = Math.min(toExpire, member.points_balance as number);
    if (expireAmt <= 0) continue;

    const newBalance = (member.points_balance as number) - expireAmt;

    await db.from("points_transactions").insert({
      member_id: member.id,
      type: "expired",
      amount: -expireAmt,
      balance_after: newBalance,
      notes: `Points older than 12 months expired`,
      created_by: "system",
    });

    await db.from("profiles").update({ points_balance: newBalance }).eq("id", member.id);

    totalExpired += expireAmt;
    membersAffected++;
  }

  return NextResponse.json({ expired: totalExpired, members_affected: membersAffected });
}

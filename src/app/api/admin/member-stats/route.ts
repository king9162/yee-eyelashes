import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();

  const [
    { count: totalMembers },
    { count: activeCoupons },
    { count: pendingReferrals },
    { count: completedReferrals },
  ] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }).not("referral_code", "is", null),
    db.from("member_coupons").select("id", { count: "exact", head: true }).eq("status", "available"),
    db.from("referrals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("referrals").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  return NextResponse.json({
    total_members:       totalMembers ?? 0,
    active_coupons:      activeCoupons ?? 0,
    pending_referrals:   pendingReferrals ?? 0,
    completed_referrals: completedReferrals ?? 0,
  });
}

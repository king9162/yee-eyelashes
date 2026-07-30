import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const db = supabaseAdmin();

  const { data: profile } = await db
    .from("profiles")
    .select("birthday, notif_birthday")
    .eq("id", user.id)
    .single();

  if (!profile?.birthday) return NextResponse.json({ ok: false, reason: "no_birthday" });
  if (!profile.notif_birthday) return NextResponse.json({ ok: false, reason: "opted_out" });

  // Check if birthday month matches current month
  const birthday = new Date(profile.birthday + "T12:00:00");
  const now = new Date();
  if (birthday.getMonth() !== now.getMonth()) {
    return NextResponse.json({ ok: false, reason: "not_birthday_month" });
  }

  // Find birthday coupon template
  const { data: couponTemplate } = await db
    .from("coupons")
    .select("id, name")
    .eq("type", "birthday")
    .eq("active", true)
    .limit(1)
    .single();

  if (!couponTemplate) return NextResponse.json({ ok: false, reason: "no_template" });

  // Check if already issued a birthday coupon this calendar year
  const yearStart = `${now.getFullYear()}-01-01T00:00:00.000Z`;
  const { data: existing } = await db
    .from("member_coupons")
    .select("id")
    .eq("member_id", user.id)
    .eq("coupon_id", couponTemplate.id)
    .gte("issued_at", yearStart)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: false, reason: "already_issued" });
  }

  // Issue the birthday coupon — valid through end of birth month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  await db.from("member_coupons").insert({
    member_id: user.id,
    coupon_id: couponTemplate.id,
    status: "available",
    expires_at: lastDay.toISOString(),
    issued_by: "system",
    notes: `Birthday reward ${now.getFullYear()}`,
  });

  return NextResponse.json({ ok: true, issued: couponTemplate.name });
}

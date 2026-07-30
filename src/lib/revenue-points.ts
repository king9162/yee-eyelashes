import { supabaseAdmin } from "@/lib/supabase";

export async function tryAwardRevenuePoints({
  db,
  entryId,
  date,
  clientName,
  amount,
}: {
  db: ReturnType<typeof supabaseAdmin>;
  entryId: string;
  date: string;
  clientName: string;
  amount: number;
}) {
  // Find a member linked to this booking
  const { data: booking } = await db
    .from("bookings")
    .select("member_id")
    .eq("date", date)
    .eq("name", clientName)
    .not("member_id", "is", null)
    .limit(1)
    .single();

  const memberId = booking?.member_id as string | undefined;
  if (!memberId) return;

  // Tag the revenue entry with this member
  await db.from("revenue_entries").update({ member_id: memberId }).eq("id", entryId);

  // Count total visits for this member (including the new one)
  const { count: visitCount } = await db
    .from("revenue_entries")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId);

  const visits = visitCount ?? 0;

  // Every 5 visits → issue a 20% off coupon
  if (visits > 0 && visits % 5 === 0) {
    const { data: template } = await db
      .from("coupons")
      .select("id")
      .eq("discount_type", "percent")
      .eq("discount_value", 20)
      .limit(1)
      .single();

    if (template) {
      await db.from("member_coupons").insert({
        member_id:  memberId,
        coupon_id:  template.id,
        status:     "available",
        issued_at:  new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        notes:      `Visit milestone — ${visits} visits`,
      });
    }
  }

  // Complete any pending referral on first visit (no bonus)
  if (visits === 1) {
    const { data: profile } = await db
      .from("profiles")
      .select("referred_by")
      .eq("id", memberId)
      .single();

    if (profile?.referred_by) {
      const { data: referral } = await db
        .from("referrals")
        .select("id")
        .eq("referrer_id", profile.referred_by as string)
        .eq("referee_id", memberId)
        .eq("status", "pending")
        .single();

      if (referral) {
        await db.from("referrals")
          .update({ status: "completed", referrer_rewarded_at: new Date().toISOString() })
          .eq("id", referral.id);
      }
    }
  }
}

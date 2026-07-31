import type { SupabaseClient } from "@supabase/supabase-js";

const VISIT_REWARD_TYPE = "visit_reward";
const VALID_DAYS = 90;

async function getOrCreateVisitRewardCoupon(db: SupabaseClient): Promise<string | null> {
  const { data: existing } = await db
    .from("coupons")
    .select("id")
    .eq("type", VISIT_REWARD_TYPE)
    .limit(1)
    .single();
  if (existing?.id) return existing.id;

  const { data: created } = await db
    .from("coupons")
    .insert({
      name: "5-Visit Reward",
      description: "Earned by completing every 5 visits at Yee Eyelashes.",
      type: VISIT_REWARD_TYPE,
      discount_type: "percentage",
      discount_value: 20,
      minimum_spend: 0,
      valid_days: VALID_DAYS,
      max_uses_per_member: null,
      active: true,
      created_by: "system",
    })
    .select("id")
    .single();
  return created?.id ?? null;
}

export async function issueMilestoneRewards(
  db: SupabaseClient,
  userId: string,
  visits: number,
): Promise<number> {
  const expected = Math.floor(visits / 5);
  if (expected === 0) return 0;

  const couponId = await getOrCreateVisitRewardCoupon(db);
  if (!couponId) return 0;

  const { count } = await db
    .from("member_coupons")
    .select("id", { count: "exact", head: true })
    .eq("member_id", userId)
    .eq("coupon_id", couponId);

  const alreadyIssued = count ?? 0;
  const toIssue = expected - alreadyIssued;
  if (toIssue <= 0) return 0;

  const now = new Date().toISOString();
  const expires = new Date(Date.now() + VALID_DAYS * 86400000).toISOString();

  for (let i = 0; i < toIssue; i++) {
    const milestone = (alreadyIssued + i + 1) * 5;
    await db.from("member_coupons").insert({
      member_id: userId,
      coupon_id: couponId,
      status: "available",
      issued_at: now,
      expires_at: expires,
      notes: `Visit milestone: ${milestone} visits`,
      issued_by: "system",
    });
  }

  return toIssue;
}

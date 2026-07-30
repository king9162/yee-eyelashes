import { supabaseAdmin } from "@/lib/supabase";

const TIERS = [
  { tier: "diamond", min: 2000 },
  { tier: "gold",    min: 1000 },
  { tier: "silver",  min: 500  },
  { tier: "member",  min: 0    },
] as const;

export function calcTier(totalSpend: number): string {
  return TIERS.find(t => totalSpend >= t.min)?.tier ?? "member";
}

export async function awardMemberPoints({
  memberId,
  amount,
  type,
  notes,
  createdBy,
  additionalSpend,
  revenueEntryId,
}: {
  memberId: string;
  amount: number;
  type: string;
  notes?: string | null;
  createdBy?: string;
  additionalSpend?: number;
  revenueEntryId?: string;
}): Promise<{ newBalance: number; newTier: string } | null> {
  if (amount === 0) return null;

  const db = supabaseAdmin();

  const { data: profile, error } = await db
    .from("profiles")
    .select("points_balance, total_spend_all_time, vip_tier")
    .eq("id", memberId)
    .single();

  if (error || !profile) return null;

  const currentBalance = profile.points_balance as number;
  const newBalance = currentBalance + amount;
  if (newBalance < 0) return null;

  const currentSpend = profile.total_spend_all_time as number;
  const newSpend = currentSpend + (additionalSpend ?? 0);
  const newTier = calcTier(newSpend);

  await db.from("points_transactions").insert({
    member_id: memberId,
    type,
    amount,
    balance_after: newBalance,
    notes: notes ?? null,
    created_by: createdBy ?? "system",
    revenue_entry_id: revenueEntryId ?? null,
  });

  const updates: Record<string, unknown> = { points_balance: newBalance };
  if (additionalSpend) updates.total_spend_all_time = newSpend;
  if (newTier !== (profile.vip_tier as string)) {
    updates.vip_tier = newTier;
    updates.vip_tier_updated_at = new Date().toISOString();
  }

  await db.from("profiles").update(updates).eq("id", memberId);

  return { newBalance, newTier };
}

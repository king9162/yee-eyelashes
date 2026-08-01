import type { SupabaseClient } from "@supabase/supabase-js";
import { issueMilestoneRewards } from "./issueMilestoneRewards";

export async function linkMemberBookings(
  db: SupabaseClient,
  userId: string,
  phone: string | null,
  email: string | null,
): Promise<number> {
  if (!phone && !email) return 0;

  const phone10 = (phone ?? "").replace(/\D/g, "").slice(-10);
  const cleanEmail = (!email || email.endsWith("@yee.member")) ? null : email;

  // Fetch all unlinked bookings and filter in code — phone formats vary (E164 vs dashes vs parens)
  const { data: allUnlinked } = await db
    .from("bookings")
    .select("id, date, status, phone, email")
    .is("member_id", null);

  const bookings = (allUnlinked ?? []).filter((b: { phone: string | null; email: string | null }) => {
    if (phone10.length === 10) {
      const bPhone10 = (b.phone ?? "").replace(/\D/g, "").slice(-10);
      if (bPhone10 === phone10) return true;
    }
    if (cleanEmail && b.email === cleanEmail) return true;
    return false;
  });

  if (!bookings || bookings.length === 0) return 0;

  const ids = bookings.map((b: { id: string }) => b.id);
  await db.from("bookings").update({ member_id: userId }).in("id", ids);

  // Recalculate visit stats from all non-cancelled bookings (Square never marks "completed")
  const { data: completed } = await db
    .from("bookings")
    .select("date")
    .eq("member_id", userId)
    .neq("status", "cancelled")
    .order("date", { ascending: false });

  const visits = completed?.length ?? 0;
  const lastVisit = completed?.[0]?.date ?? null;
  const vip_tier = visits >= 20 ? "diamond" : visits >= 10 ? "gold" : visits >= 5 ? "silver" : "member";

  await db.from("profiles").update({
    total_visits_all_time: visits,
    last_visit_date: lastVisit,
    vip_tier,
  }).eq("id", userId);

  await issueMilestoneRewards(db, userId, visits);

  return ids.length;
}

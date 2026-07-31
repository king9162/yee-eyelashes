import type { SupabaseClient } from "@supabase/supabase-js";

export async function linkMemberBookings(
  db: SupabaseClient,
  userId: string,
  phone: string | null,
  email: string | null,
): Promise<number> {
  if (!phone && !email) return 0;

  const filters: string[] = [];
  if (phone) filters.push(`phone.eq.${phone}`);
  if (email && !email.endsWith("@yee.member")) filters.push(`email.eq.${email}`);

  if (filters.length === 0) return 0;

  const { data: bookings } = await db
    .from("bookings")
    .select("id, date, status")
    .is("member_id", null)
    .or(filters.join(","));

  if (!bookings || bookings.length === 0) return 0;

  const ids = bookings.map((b: { id: string }) => b.id);
  await db.from("bookings").update({ member_id: userId }).in("id", ids);

  // Recalculate visit stats from all completed bookings now linked
  const { data: completed } = await db
    .from("bookings")
    .select("date")
    .eq("member_id", userId)
    .eq("status", "completed")
    .order("date", { ascending: false });

  const visits = completed?.length ?? 0;
  const lastVisit = completed?.[0]?.date ?? null;

  await db.from("profiles").update({
    total_visits_all_time: visits,
    last_visit_date: lastVisit,
  }).eq("id", userId);

  return ids.length;
}

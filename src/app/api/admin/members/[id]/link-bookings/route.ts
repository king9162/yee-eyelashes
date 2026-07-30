import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: profile } = await db
    .from("profiles")
    .select("phone, email")
    .eq("id", id)
    .single();

  if (!profile) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { phone, email } = profile as { phone: string | null; email: string | null };

  if (!phone && !email) {
    return NextResponse.json({ linked: 0, message: "No phone or email to match" });
  }

  // Build OR filter
  const filters: string[] = [];
  if (phone) filters.push(`phone.eq.${phone}`);
  if (email) filters.push(`email.eq.${email}`);

  const { data: bookings } = await db
    .from("bookings")
    .select("id, date, status")
    .is("member_id", null)
    .or(filters.join(","));

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ linked: 0, message: "No unlinked bookings found" });
  }

  // Link all matching bookings
  const ids = bookings.map((b: { id: string }) => b.id);
  await db.from("bookings").update({ member_id: id }).in("id", ids);

  // Recalculate stats from completed bookings
  const { data: completed } = await db
    .from("bookings")
    .select("date")
    .eq("member_id", id)
    .eq("status", "completed")
    .order("date", { ascending: false });

  const visits = completed?.length ?? 0;
  const lastVisit = completed?.[0]?.date ?? null;

  await db.from("profiles").update({
    total_visits_all_time: visits,
    last_visit_date: lastVisit,
  }).eq("id", id);

  return NextResponse.json({ linked: ids.length, visits, lastVisit });
}

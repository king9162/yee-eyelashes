import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await anonClient.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Get member's phone and email
  const { data: profile } = await admin
    .from("profiles")
    .select("phone, email")
    .eq("id", user.id)
    .single();

  if (!profile?.phone && !profile?.email) {
    return NextResponse.json({ linked: 0 });
  }

  // Build filter: match by phone OR email
  let filter = "";
  if (profile.phone && profile.email) {
    filter = `phone.eq.${profile.phone},email.ilike.${profile.email}`;
  } else if (profile.phone) {
    filter = `phone.eq.${profile.phone}`;
  } else {
    filter = `email.ilike.${profile.email}`;
  }

  // Find unlinked bookings matching this member
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, date, status")
    .or(filter)
    .is("member_id", null);

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ linked: 0 });
  }

  const ids = bookings.map(b => b.id);
  await admin.from("bookings").update({ member_id: user.id }).in("id", ids);

  // Recalculate stats from completed bookings
  const { data: completed } = await admin
    .from("bookings")
    .select("date")
    .eq("member_id", user.id)
    .eq("status", "completed")
    .order("date", { ascending: false });

  if (completed && completed.length > 0) {
    await admin.from("profiles").update({
      total_visits_all_time: completed.length,
      last_visit_date: completed[0].date,
    }).eq("id", user.id);
  }

  return NextResponse.json({ linked: ids.length });
}

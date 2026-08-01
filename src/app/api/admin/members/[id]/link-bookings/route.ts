import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { linkMemberBookings } from "@/lib/linkMemberBookings";
import { issueMilestoneRewards } from "@/lib/issueMilestoneRewards";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: profile } = await db
    .from("profiles")
    .select("phone, email, first_name, last_name")
    .eq("id", id)
    .single();

  if (!profile) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Step 1: link any existing bookings by phone/email
  let linked = await linkMemberBookings(db, id, profile.phone ?? null, profile.email ?? null);

  // Step 2: backfill visits from the clients table (My Clients) that aren't yet in bookings
  const phone10 = (profile.phone ?? "").replace(/\D/g, "").slice(-10);
  const cleanEmail = profile.email && !profile.email.endsWith("@yee.member") ? profile.email : null;

  if (phone10.length === 10 || cleanEmail) {
    const { data: allClients } = await db
      .from("clients")
      .select("visit_date, first_name, last_name, phone, email")
      .not("visit_date", "is", null);

    const matchingVisits = (allClients ?? []).filter(c => {
      const cPhone10 = (c.phone ?? "").replace(/\D/g, "").slice(-10);
      return (phone10.length === 10 && cPhone10 === phone10) ||
             (cleanEmail && c.email === cleanEmail);
    });

    if (matchingVisits.length > 0) {
      const { data: existingBookings } = await db
        .from("bookings")
        .select("date")
        .eq("member_id", id);

      const existingDates = new Set((existingBookings ?? []).map((b: { date: string }) => b.date));
      let created = 0;

      for (const cv of matchingVisits) {
        if (!cv.visit_date || existingDates.has(cv.visit_date)) continue;
        await db.from("bookings").insert({
          member_id: id,
          name:          `${cv.first_name ?? ""} ${cv.last_name ?? ""}`.trim() || profile.first_name,
          phone:         profile.phone ?? cv.phone ?? "",
          email:         cleanEmail ?? cv.email ?? "",
          date:          cv.visit_date,
          service:       "square",
          service_label: "Visit",
          status:        "confirmed",
          notes:         "",
        });
        existingDates.add(cv.visit_date);
        created++;
      }

      if (created > 0) {
        // Recalculate visits from all linked bookings
        const { data: allBookings } = await db
          .from("bookings")
          .select("date")
          .eq("member_id", id)
          .neq("status", "cancelled")
          .order("date", { ascending: false });

        const visits = allBookings?.length ?? 0;
        const lastVisit = (allBookings?.[0]?.date as string) ?? null;
        const vip_tier = visits >= 20 ? "diamond" : visits >= 10 ? "gold" : visits >= 5 ? "silver" : "member";

        await db.from("profiles").update({
          total_visits_all_time: visits,
          last_visit_date: lastVisit,
          vip_tier,
        }).eq("id", id);

        await issueMilestoneRewards(db, id, visits);
        linked += created;
      }
    }
  }

  return NextResponse.json({ linked });
}

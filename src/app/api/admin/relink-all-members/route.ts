import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { issueMilestoneRewards } from "@/lib/issueMilestoneRewards";

type ClientRow = { visit_date?: string | null; notes?: string | null };

// Aggregate per-visit notes into "MM/DD: note" lines, newest first.
// Returns null if no rows have notes (skip update), "" if rows exist but no notes.
function buildAggregatedNotes(rows: ClientRow[]): string | null {
  const withNotes = rows
    .filter(r => r.notes?.trim())
    .sort((a, b) => (b.visit_date ?? "").localeCompare(a.visit_date ?? ""));
  if (withNotes.length === 0) return null;
  return withNotes.map(r => {
    if (!r.visit_date) return r.notes!.trim();
    const [, m, d] = r.visit_date.split("-");
    return `${m}/${d}: ${r.notes!.trim()}`;
  }).join("\n");
}

export async function POST(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const [{ data: profiles }, { data: allClients }, { data: allUnlinked }] = await Promise.all([
    db.from("profiles").select("id, phone, email, first_name, admin_notes").is("deleted_at", null),
    db.from("clients").select("id, phone, email, visit_date, notes"),
    db.from("bookings").select("id, phone, email").is("member_id", null),
  ]);

  let totalLinked = 0;
  let notesSynced = 0;

  for (const profile of profiles ?? []) {
    const phone10 = (profile.phone ?? "").replace(/\D/g, "").slice(-10);
    const cleanEmail = profile.email && !profile.email.endsWith("@yee.member") ? profile.email : null;
    if (!phone10 && !cleanEmail) continue;

    const matchPhone = (p: string | null) =>
      phone10.length === 10 && (p ?? "").replace(/\D/g, "").slice(-10) === phone10;
    const matchEmail = (e: string | null) =>
      !!cleanEmail && e === cleanEmail;

    // 1. Link unlinked bookings by phone/email
    const toLink = (allUnlinked ?? []).filter(
      (b: { phone: string | null; email: string | null }) => matchPhone(b.phone) || matchEmail(b.email)
    );
    if (toLink.length > 0) {
      const ids = toLink.map((b: { id: string }) => b.id);
      await db.from("bookings").update({ member_id: profile.id }).in("id", ids);
      totalLinked += ids.length;
    }

    // 2. Aggregate per-visit notes from clients → profiles.admin_notes
    // Format: "MM/DD: note text" per row, newest first
    const aggregated = buildAggregatedNotes(
      (allClients ?? []).filter(
        (c: { phone: string | null; email: string | null }) => matchPhone(c.phone) || matchEmail(c.email)
      )
    );
    if (aggregated !== null) {
      await db.from("profiles").update({ admin_notes: aggregated || null }).eq("id", profile.id);
      notesSynced++;
    }

    // 3. Backfill visit bookings from clients table for dates not yet in bookings
    const matchingClients = (allClients ?? []).filter(
      (c: { phone: string | null; email: string | null; visit_date: string | null }) =>
        c.visit_date && (matchPhone(c.phone) || matchEmail(c.email))
    );

    if (matchingClients.length > 0) {
      const { data: existingBookings } = await db
        .from("bookings")
        .select("date")
        .eq("member_id", profile.id);

      const existingDates = new Set((existingBookings ?? []).map((b: { date: string }) => b.date));
      let created = 0;

      for (const cv of matchingClients as { phone: string | null; email: string | null; visit_date: string; notes: string | null }[]) {
        if (existingDates.has(cv.visit_date)) continue;
        await db.from("bookings").insert({
          member_id:     profile.id,
          name:          profile.first_name ?? "",
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
        totalLinked++;
      }
    }

    // 4. Recalculate visit stats
    const { data: allBookings } = await db
      .from("bookings")
      .select("date")
      .eq("member_id", profile.id)
      .neq("status", "cancelled")
      .order("date", { ascending: false });

    const visits = allBookings?.length ?? 0;
    const lastVisit = (allBookings?.[0]?.date as string) ?? null;
    const vip_tier = visits >= 20 ? "diamond" : visits >= 10 ? "gold" : visits >= 5 ? "silver" : "member";

    await db.from("profiles").update({
      total_visits_all_time: visits,
      last_visit_date: lastVisit,
      vip_tier,
    }).eq("id", profile.id);

    await issueMilestoneRewards(db, profile.id, visits);
  }

  return NextResponse.json({ linked: totalLinked, notesSynced });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { issueMilestoneRewards } from "@/lib/issueMilestoneRewards";

type ClientRow = { visit_date?: string | null; notes?: string | null };

const normP = (p: string | null) => (p ?? "").replace(/\D/g, "").slice(-10);

// Aggregate per-visit notes into "MM/DD: note" lines, newest first.
// Skips rows whose visit_date is in cancelledDates.
// Returns null if no rows with notes remain (skip update).
function buildAggregatedNotes(rows: ClientRow[], cancelledDates: Set<string> = new Set()): string | null {
  const withNotes = rows
    .filter(r => r.notes?.trim() && !cancelledDates.has(r.visit_date ?? ""))
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

  const [{ data: profiles }, { data: allClients }, { data: allUnlinked }, { data: cancelledBkgs }] = await Promise.all([
    db.from("profiles").select("id, phone, email, first_name, admin_notes").is("deleted_at", null),
    db.from("clients").select("id, phone, email, visit_date, notes"),
    db.from("bookings").select("id, phone, email").is("member_id", null),
    db.from("bookings").select("phone, email, date").eq("status", "cancelled"),
  ]);

  // Build cancelled-date lookup by phone10 and email
  const cancelledPhoneMap = new Map<string, Set<string>>();
  const cancelledEmailMap = new Map<string, Set<string>>();
  for (const b of cancelledBkgs ?? []) {
    const p = normP(b.phone);
    if (p) {
      if (!cancelledPhoneMap.has(p)) cancelledPhoneMap.set(p, new Set());
      cancelledPhoneMap.get(p)!.add(b.date);
    }
    if (b.email) {
      if (!cancelledEmailMap.has(b.email)) cancelledEmailMap.set(b.email, new Set());
      cancelledEmailMap.get(b.email)!.add(b.date);
    }
  }

  let totalLinked = 0;
  let notesSynced = 0;
  const insertErrors: string[] = [];

  for (const profile of profiles ?? []) {
    const phone10 = normP(profile.phone);
    const cleanEmail = profile.email && !profile.email.endsWith("@yee.member") ? profile.email : null;
    if (!phone10 && !cleanEmail) continue;

    const matchPhone = (p: string | null) => phone10.length === 10 && normP(p) === phone10;
    const matchEmail = (e: string | null) => !!cleanEmail && e === cleanEmail;

    // Cancelled dates for this person (union of phone + email matches)
    const myCancelledDates = new Set<string>([
      ...(phone10 ? (cancelledPhoneMap.get(phone10) ?? []) : []),
      ...(cleanEmail ? (cancelledEmailMap.get(cleanEmail) ?? []) : []),
    ]);

    // 1. Link unlinked bookings by phone/email
    const toLink = (allUnlinked ?? []).filter(
      (b: { phone: string | null; email: string | null }) => matchPhone(b.phone) || matchEmail(b.email)
    );
    if (toLink.length > 0) {
      const ids = toLink.map((b: { id: string }) => b.id);
      await db.from("bookings").update({ member_id: profile.id }).in("id", ids);
      totalLinked += ids.length;
    }

    const matchingClients = (allClients ?? []).filter(
      (c: { phone: string | null; email: string | null; visit_date: string | null }) =>
        c.visit_date && (matchPhone(c.phone) || matchEmail(c.email))
    );

    // 2. Aggregate per-visit notes → profiles.admin_notes (skip cancelled visit dates)
    const aggregated = buildAggregatedNotes(matchingClients, myCancelledDates);
    if (aggregated !== null) {
      await db.from("profiles").update({ admin_notes: aggregated || null }).eq("id", profile.id);
      notesSynced++;
    }

    // 3. Backfill confirmed visit bookings from clients — skip cancelled dates
    if (matchingClients.length > 0) {
      const { data: existingBookings } = await db
        .from("bookings")
        .select("date")
        .eq("member_id", profile.id);

      const existingDates = new Set((existingBookings ?? []).map((b: { date: string }) => b.date));

      for (const cv of matchingClients as { phone: string | null; email: string | null; visit_date: string }[]) {
        if (existingDates.has(cv.visit_date)) continue;
        if (myCancelledDates.has(cv.visit_date)) continue; // skip cancelled

        const { error: insertErr } = await db.from("bookings").insert({
          member_id:     profile.id,
          name:          profile.first_name ?? "",
          phone:         profile.phone ?? cv.phone ?? "",
          email:         cleanEmail ?? cv.email ?? "",
          date:          cv.visit_date,
          time:          "",
          duration_min:  0,
          service:       "square",
          service_label: "Visit",
          status:        "confirmed",
          notes:         "",
        });
        if (insertErr) {
          console.error("Booking insert error:", insertErr.message, "for date", cv.visit_date, "member", profile.id);
          insertErrors.push(`${cv.visit_date}: ${insertErr.message}`);
        } else {
          existingDates.add(cv.visit_date);
          totalLinked++;
        }
      }
    }

    // 4. Recalculate visit stats from all non-cancelled bookings
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

  return NextResponse.json({ linked: totalLinked, notesSynced, insertErrors });
}

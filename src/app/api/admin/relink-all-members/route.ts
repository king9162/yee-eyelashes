import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { issueMilestoneRewards } from "@/lib/issueMilestoneRewards";

const normP = (p: string | null) => (p ?? "").replace(/\D/g, "").slice(-10);

type ClientRow = { visit_date?: string | null; notes?: string | null };

function buildAggregatedNotes(rows: ClientRow[], skipDates: Set<string> = new Set()): string | null {
  const withNotes = rows
    .filter(r => r.notes?.trim() && !skipDates.has(r.visit_date ?? ""))
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

  const [{ data: profiles }, { data: allClients }, { data: allUnlinked }, { data: allMemberBkgs }] = await Promise.all([
    db.from("profiles").select("id, phone, email, first_name, admin_notes").is("deleted_at", null),
    db.from("clients").select("id, phone, email, visit_date, notes"),
    db.from("bookings").select("id, phone, email").is("member_id", null),
    // Include id so we can update status
    db.from("bookings").select("id, member_id, date, status").not("member_id", "is", null),
  ]);

  // Group by member_id
  const bkgsByMember = new Map<string, { id: string; date: string; status: string }[]>();
  for (const b of allMemberBkgs ?? []) {
    if (!bkgsByMember.has(b.member_id)) bkgsByMember.set(b.member_id, []);
    bkgsByMember.get(b.member_id)!.push({ id: b.id, date: b.date, status: b.status });
  }

  let totalLinked = 0;
  let notesSynced = 0;

  for (const profile of profiles ?? []) {
    const phone10 = normP(profile.phone);
    const cleanEmail = profile.email && !profile.email.endsWith("@yee.member") ? profile.email : null;
    if (!phone10 && !cleanEmail) continue;

    const matchPhone = (p: string | null) => phone10.length === 10 && normP(p) === phone10;
    const matchEmail = (e: string | null) => !!cleanEmail && e === cleanEmail;

    // 1. Link unlinked bookings
    const toLink = (allUnlinked ?? []).filter(
      (b: { phone: string | null; email: string | null }) => matchPhone(b.phone) || matchEmail(b.email)
    );
    if (toLink.length > 0) {
      const ids = toLink.map((b: { id: string }) => b.id);
      await db.from("bookings").update({ member_id: profile.id }).in("id", ids);
      totalLinked += ids.length;
    }

    const memberBkgs = bkgsByMember.get(profile.id) ?? [];
    // Dates with confirmed bookings (won't touch these)
    const confirmedDates = new Set(memberBkgs.filter(b => b.status !== "cancelled").map(b => b.date));
    // Cancelled bookings by date — may need to be promoted to confirmed
    const cancelledBkgByDate = new Map(memberBkgs.filter(b => b.status === "cancelled").map(b => [b.date, b.id]));
    // Dates that only have cancelled bookings (no confirmed) — these are "cancelled visits" in My Clients
    const cancelledOnlyDates = new Set(
      [...cancelledBkgByDate.keys()].filter(d => !confirmedDates.has(d))
    );

    const matchingClients = (allClients ?? []).filter(
      (c: { phone: string | null; email: string | null; visit_date: string | null }) =>
        c.visit_date && (matchPhone(c.phone) || matchEmail(c.email))
    ) as { phone: string | null; email: string | null; visit_date: string; notes: string | null }[];

    // 2. Aggregate notes → profiles.admin_notes (skip dates that are cancelled-only)
    const aggregated = buildAggregatedNotes(matchingClients, cancelledOnlyDates);
    if (aggregated !== null) {
      await db.from("profiles").update({ admin_notes: aggregated || null }).eq("id", profile.id);
      notesSynced++;
    }

    // 3. Backfill visits from clients table
    for (const cv of matchingClients) {
      if (confirmedDates.has(cv.visit_date)) continue; // already a confirmed booking for this date

      const cancelledId = cancelledBkgByDate.get(cv.visit_date);

      if (cancelledId) {
        // Booking exists but is cancelled — promote to confirmed so it counts as a visit
        const { error } = await db.from("bookings").update({ status: "confirmed" }).eq("id", cancelledId);
        if (!error) {
          confirmedDates.add(cv.visit_date);
          cancelledBkgByDate.delete(cv.visit_date);
          totalLinked++;
        }
      } else {
        // No booking at all for this date — insert a new confirmed one
        const { error } = await db.from("bookings").insert({
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
        if (!error) {
          confirmedDates.add(cv.visit_date);
          totalLinked++;
        }
      }
    }

    // 4. Recalculate visit stats
    const { data: confirmedBkgs } = await db
      .from("bookings")
      .select("date")
      .eq("member_id", profile.id)
      .neq("status", "cancelled")
      .order("date", { ascending: false });

    const visits = confirmedBkgs?.length ?? 0;
    const lastVisit = (confirmedBkgs?.[0]?.date as string) ?? null;
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

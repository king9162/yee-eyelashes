import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { issueMilestoneRewards } from "@/lib/issueMilestoneRewards";

const normP = (p: string | null) => (p ?? "").replace(/\D/g, "").slice(-10);

type ClientRow = { visit_date?: string | null; notes?: string | null };

// Format per-visit notes as "MM/DD: note" lines, newest first.
// skipDates = dates that should be excluded (e.g. cancelled visits with no confirmed counterpart).
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

  // Load everything upfront in parallel
  const [{ data: profiles }, { data: allClients }, { data: allUnlinked }, { data: allMemberBkgs }] = await Promise.all([
    db.from("profiles").select("id, phone, email, first_name, admin_notes").is("deleted_at", null),
    db.from("clients").select("id, phone, email, visit_date, notes"),
    db.from("bookings").select("id, phone, email").is("member_id", null),
    // All bookings that are already linked to a member — used to determine which dates to skip
    db.from("bookings").select("member_id, date, status").not("member_id", "is", null),
  ]);

  // Group member bookings by member_id
  const bkgsByMember = new Map<string, { date: string; status: string }[]>();
  for (const b of allMemberBkgs ?? []) {
    if (!bkgsByMember.has(b.member_id)) bkgsByMember.set(b.member_id, []);
    bkgsByMember.get(b.member_id)!.push({ date: b.date, status: b.status });
  }

  let totalLinked = 0;
  let notesSynced = 0;
  const errors: string[] = [];
  const debugLines: string[] = [];

  for (const profile of profiles ?? []) {
    const phone10 = normP(profile.phone);
    const cleanEmail = profile.email && !profile.email.endsWith("@yee.member") ? profile.email : null;
    if (!phone10 && !cleanEmail) continue;

    const matchPhone = (p: string | null) => phone10.length === 10 && normP(p) === phone10;
    const matchEmail = (e: string | null) => !!cleanEmail && e === cleanEmail;

    // 1. Link unlinked bookings (from Square sync) to this member
    const toLink = (allUnlinked ?? []).filter(
      (b: { phone: string | null; email: string | null }) => matchPhone(b.phone) || matchEmail(b.email)
    );
    if (toLink.length > 0) {
      const ids = toLink.map((b: { id: string }) => b.id);
      await db.from("bookings").update({ member_id: profile.id }).in("id", ids);
      totalLinked += ids.length;
    }

    // Existing member booking dates (all statuses) — used to detect what already exists
    const memberBkgs = bkgsByMember.get(profile.id) ?? [];
    const allMemberDates = new Set(memberBkgs.map(b => b.date));
    // Dates that have a confirmed booking vs only cancelled
    const confirmedDates = new Set(memberBkgs.filter(b => b.status !== "cancelled").map(b => b.date));
    // Dates that are cancelled-only (no confirmed counterpart) — skip in notes
    const cancelledOnlyDates = new Set(
      memberBkgs.filter(b => b.status === "cancelled" && !confirmedDates.has(b.date)).map(b => b.date)
    );

    // Client rows matching this member
    const matchingClients = (allClients ?? []).filter(
      (c: { phone: string | null; email: string | null; visit_date: string | null }) =>
        c.visit_date && (matchPhone(c.phone) || matchEmail(c.email))
    );

    // 2. Aggregate per-visit notes → profiles.admin_notes (skip cancelled-only dates)
    const aggregated = buildAggregatedNotes(matchingClients, cancelledOnlyDates);
    if (aggregated !== null) {
      await db.from("profiles").update({ admin_notes: aggregated || null }).eq("id", profile.id);
      notesSynced++;
    }

    // 3. Backfill confirmed visit bookings for client dates not yet tracked at all
    debugLines.push(`${profile.first_name}: clients=${matchingClients.length} memberDates=[${[...allMemberDates].join(",")}]`);
    for (const cv of matchingClients as { phone: string | null; email: string | null; visit_date: string }[]) {
      if (allMemberDates.has(cv.visit_date)) { debugLines.push(`  skip ${cv.visit_date} (exists)`); continue; }

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
        errors.push(`${cv.visit_date}: ${insertErr.message}`);
      } else {
        allMemberDates.add(cv.visit_date);
        confirmedDates.add(cv.visit_date);
        totalLinked++;
      }
    }

    // 4. Recalculate visit stats from all non-cancelled bookings for this member
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

  return NextResponse.json({ linked: totalLinked, notesSynced, errors, debug: debugLines.join(" | ") });
}

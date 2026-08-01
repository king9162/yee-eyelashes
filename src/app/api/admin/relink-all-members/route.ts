import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { issueMilestoneRewards } from "@/lib/issueMilestoneRewards";

const normP = (p: string | null) => (p ?? "").replace(/\D/g, "").slice(-10);

type ClientRow = { visit_date?: string | null; notes?: string | null };

function buildAggregatedNotes(rows: ClientRow[], skipDates: Set<string>): string | null {
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

  const [{ data: profiles }, { data: allClients }, { data: allUnlinked }, { data: allBkgs }] = await Promise.all([
    db.from("profiles").select("id, phone, email, first_name").is("deleted_at", null),
    db.from("clients").select("id, phone, email, visit_date, notes"),
    db.from("bookings").select("id, phone, email").is("member_id", null),
    // Need phone + date + status to find cancelled dates per member
    db.from("bookings").select("phone, date, status"),
  ]);

  let totalLinked = 0;
  let notesSynced = 0;

  for (const profile of profiles ?? []) {
    const phone10 = normP(profile.phone);
    const cleanEmail = profile.email && !profile.email.endsWith("@yee.member") ? profile.email : null;
    if (!phone10 && !cleanEmail) continue;

    const matchPhone = (p: string | null) => phone10.length === 10 && normP(p) === phone10;
    const matchEmail = (e: string | null) => !!cleanEmail && e === cleanEmail;

    // 1. Link unlinked bookings to this member
    const toLink = (allUnlinked ?? []).filter(
      (b: { phone: string | null; email: string | null }) => matchPhone(b.phone) || matchEmail(b.email)
    );
    if (toLink.length > 0) {
      const ids = toLink.map((b: { id: string }) => b.id);
      await db.from("bookings").update({ member_id: profile.id }).in("id", ids);
      totalLinked += ids.length;
    }

    // 2. Client visit rows for this member (by phone/email)
    const matchingClients = (allClients ?? []).filter(
      (c: { phone: string | null; email: string | null; visit_date: string | null }) =>
        c.visit_date && (matchPhone(c.phone) || matchEmail(c.email))
    ) as { visit_date: string; notes: string | null }[];

    // Dates that have any cancelled booking for this phone — same logic as My Clients display
    const cancelledDates = new Set(
      (allBkgs ?? [])
        .filter((b: { phone: string | null; date: string; status: string }) =>
          b.status === "cancelled" && matchPhone(b.phone)
        )
        .map((b: { date: string }) => b.date)
    );

    // 3. Aggregate notes — skip dates with any cancelled booking
    const aggregated = buildAggregatedNotes(matchingClients, cancelledDates);
    if (aggregated !== null) {
      await db.from("profiles").update({ admin_notes: aggregated || null }).eq("id", profile.id);
      notesSynced++;
    }

    // 4. Visit count from clients table (excluding cancelled dates) — no booking status changes
    const confirmedVisits = matchingClients.filter(c => !cancelledDates.has(c.visit_date));
    const visits = confirmedVisits.length;
    const lastVisit = confirmedVisits[0]?.visit_date ?? null; // already sorted desc by query
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

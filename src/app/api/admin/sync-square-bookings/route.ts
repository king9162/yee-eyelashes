import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const normP = (p: string) => (p ?? "").replace(/\D/g, "").slice(-10);

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token      = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!token || !locationId) {
    return NextResponse.json({ error: "Missing Square env vars" }, { status: 500 });
  }

  const db = supabaseAdmin();

  // Square limits date range to 31 days per request — generate 30-day windows
  // from today (ET) through 90 days ahead
  const now = new Date();
  const todayET = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // "YYYY-MM-DD"
  const rangeStart = new Date(todayET + "T00:00:00Z"); // midnight UTC = safe start for any ET day
  const rangeEnd   = new Date(now.getTime() + 90 * 86400000);
  const ranges: { min: Date; max: Date }[] = [];
  let cur = new Date(rangeStart);
  while (cur < rangeEnd) {
    const next = new Date(Math.min(cur.getTime() + 30 * 86400000, rangeEnd.getTime()));
    ranges.push({ min: new Date(cur), max: next });
    cur = next;
  }

  const squareBookings: Record<string, unknown>[] = [];

  for (const { min, max } of ranges) {
    let cursor: string | undefined;
    do {
      const params = new URLSearchParams({
        location_id:  locationId,
        start_at_min: min.toISOString(),
        start_at_max: max.toISOString(),
        limit:        "100",
      });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(
        `https://connect.squareup.com/v2/bookings?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}`, "Square-Version": "2024-01-18" } }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.errors?.[0]?.detail ?? "Square API error" }, { status: 500 });
      }
      squareBookings.push(...(data.bookings ?? []));
      cursor = data.cursor as string | undefined;
    } while (cursor);
  }

  // Deduplicate by Square booking id
  const seen = new Set<string>();
  const unique = squareBookings.filter(b => {
    const id = b.id as string;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // Fetch service names from Square Catalog API (batch)
  const variationIds = [...new Set(
    unique.flatMap(b => {
      const segs = b.appointment_segments as Record<string, unknown>[] | undefined;
      return segs?.map(s => s.service_variation_id as string).filter(Boolean) ?? [];
    })
  )];
  const serviceNameMap = new Map<string, string>();
  if (variationIds.length > 0) {
    try {
      const catRes = await fetch("https://connect.squareup.com/v2/catalog/batch-retrieve-objects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Square-Version": "2024-01-18", "Content-Type": "application/json" },
        body: JSON.stringify({
          object_ids: variationIds,
          include_deleted_objects: true,
          include_related_objects: true,
        }),
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        // Build parent item name map from related_objects
        const itemNameMap = new Map<string, string>();
        for (const obj of catData.related_objects ?? []) {
          if (obj.type === "ITEM" && obj.item_data?.name) {
            itemNameMap.set(obj.id as string, obj.item_data.name as string);
          }
        }
        for (const obj of catData.objects ?? []) {
          if (obj.type === "ITEM_VARIATION") {
            const varName = obj.item_variation_data?.name as string | undefined;
            const parentId = obj.item_variation_data?.item_id as string | undefined;
            const parentName = parentId ? itemNameMap.get(parentId) : undefined;
            const name = varName || parentName;
            if (name) serviceNameMap.set(obj.id as string, name);
          }
        }
      }
    } catch { /* non-fatal */ }
  }

  // Batch-fetch Square "Client notes" (customer.note) — added manually by us in Square customer profile
  const uniqueCustomerIds = [...new Set(unique.map(b => b.customer_id as string).filter(Boolean))];
  const customerNoteMap = new Map<string, string>(); // customerId → customer.note
  await Promise.all(uniqueCustomerIds.map(async (customerId) => {
    try {
      const res = await fetch(`https://connect.squareup.com/v2/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}`, "Square-Version": "2024-01-18" },
      });
      if (res.ok) {
        const data = await res.json();
        const note = (data.customer?.note as string | undefined) ?? "";
        if (note) customerNoteMap.set(customerId, note);
      }
    } catch { /* non-fatal */ }
  }));
  // Map square_booking_id → customer profile note
  const clientNoteBySquareId = new Map<string, string>();
  for (const b of unique) {
    const cid = b.customer_id as string | undefined;
    if (cid) clientNoteBySquareId.set(b.id as string, customerNoteMap.get(cid) ?? "");
  }

  // Load all existing DB bookings once for fast lookup
  const { data: dbBookings } = await db
    .from("bookings")
    .select("id, square_booking_id, phone, email, date, time, notes, name, service_label");

  const bySquareId  = new Map<string, { id: string; name: string; notes: string; service_label: string }>();
  const byPhoneDate = new Map<string, string>(); // "normPhone|date" -> booking.id

  for (const b of dbBookings ?? []) {
    if (b.square_booking_id) bySquareId.set(b.square_booking_id, {
      id: b.id, name: b.name ?? "", notes: b.notes ?? "", service_label: b.service_label ?? "",
    });
    const ph = normP(b.phone);
    if (ph && b.date) byPhoneDate.set(`${ph}|${b.date}`, b.id);
    if (b.email && b.date) byPhoneDate.set(`${b.email}|${b.date}`, b.id);
  }

  // Track which Square booking IDs were returned — any future DB booking NOT in this set was cancelled
  const returnedSquareIds = new Set(unique.map(b => b.id as string));

  let synced = 0;
  const logEntries: { ts: string; type: "booking" | "client"; name: string; sub: string }[] = [];
  const now_ts = new Date().toISOString();

  for (const sb of unique) {
    const squareBookingId = sb.id as string;
    if (!squareBookingId) continue;

    const startAt     = sb.start_at as string | undefined;
    const visitDate   = startAt
      ? new Date(startAt).toLocaleDateString("en-CA", { timeZone: "America/New_York" })
      : "";
    const bookingTime = startAt
      ? new Date(startAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })
      : "";
    const segments      = sb.appointment_segments as Record<string, unknown>[] | undefined;
    const varId         = segments?.[0]?.service_variation_id as string | undefined;
    const durationMin   = (segments?.[0]?.duration_minutes as number) ?? 60;
    const serviceLabel  = (varId && serviceNameMap.get(varId)) || `${durationMin} min`;
    const squareStatus  = ((sb.status as string) ?? "").toUpperCase();
    const status        = squareStatus.includes("CANCEL") ? "cancelled" : "confirmed";

    // 1. Match by square_booking_id — update service info only, never overwrite admin notes
    const existingById = bySquareId.get(squareBookingId);
    if (existingById) {
      const update: Record<string, unknown> = {
        service_label: serviceLabel, date: visitDate,
        time: bookingTime, duration_min: durationMin, status,
      };
      await db.from("bookings").update(update).eq("id", existingById.id);
      const serviceChanged = serviceLabel !== "Square Appointment" && serviceLabel !== existingById.service_label;
      if (serviceChanged) {
        logEntries.push({ ts: now_ts, type: "booking", name: existingById.name,
          sub: `${visitDate} ${bookingTime} · ${serviceLabel}` });
      }
      synced++;
      continue;
    }

    // Fetch customer info from Square
    const customerId = sb.customer_id as string | undefined;
    let name = "Unknown", phone = "", email = "";
    if (customerId) {
      try {
        const cRes = await fetch(`https://connect.squareup.com/v2/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}`, "Square-Version": "2024-01-18" },
        });
        if (cRes.ok) {
          const cd = await cRes.json();
          const c  = cd.customer;
          name  = `${c?.given_name ?? ""} ${c?.family_name ?? ""}`.trim() || "Unknown";
          phone = c?.phone_number ?? "";
          email = c?.email_address ?? "";
        }
      } catch { /* non-fatal */ }
    }

    // 2. Match by phone+date or email+date to avoid duplicates from manual entries
    const ph = normP(phone);
    const dupeId = (ph && byPhoneDate.get(`${ph}|${visitDate}`)) ||
                   (email && byPhoneDate.get(`${email}|${visitDate}`));

    if (dupeId) {
      // Merge: attach square_booking_id and update service info only
      await db.from("bookings").update({
        square_booking_id: squareBookingId,
        service_label:     serviceLabel,
        duration_min:      durationMin,
        status,
      }).eq("id", dupeId);
      bySquareId.set(squareBookingId, { id: dupeId, name, notes: "", service_label: serviceLabel });
      synced++;
      continue;
    }

    // 3. New booking — skip past appointments (before today)
    if (visitDate < todayET) { synced++; continue; }

    // Insert — notes always start empty; admin fills them manually
    await db.from("bookings").insert({
      name, phone, email,
      service:           "square",
      service_label:     serviceLabel,
      date:              visitDate,
      time:              bookingTime,
      status,
      duration_min:      durationMin,
      notes:             "",
      square_booking_id: squareBookingId,
    });
    logEntries.push({ ts: now_ts, type: "booking", name, sub: `${visitDate} ${bookingTime} · ${serviceLabel}` });
    synced++;
  }

  // Mark DB bookings as cancelled if Square no longer returns them (i.e. they were cancelled in Square)
  // Mark DB bookings as cancelled if Square no longer returns them (cancelled on Square side)
  const { data: futureSquareBookings } = await db
    .from("bookings")
    .select("id, square_booking_id")
    .gte("date", todayET)
    .neq("status", "cancelled")
    .not("square_booking_id", "is", null);

  for (const b of (futureSquareBookings ?? []) as { id: string; square_booking_id: string }[]) {
    if (!returnedSquareIds.has(b.square_booking_id)) {
      await db.from("bookings").update({ status: "cancelled" }).eq("id", b.id);
    }
  }

  // Auto-sync new Square bookings into clients table (today and future only)
  const { data: allSquareBookings } = await db.from("bookings").select("*")
    .not("square_booking_id", "is", null)
    .gte("date", todayET);
  const { data: existingClients } = await db.from("clients").select("id, phone, email, visit_date, notes, first_name, last_name, booking_id");
  let clientsSynced = 0;

  for (const b of allSquareBookings ?? []) {
    if (!b.date || b.status === "cancelled") continue;
    const bPhone = normP(b.phone);
    // Only sync the Square "Client notes" field (manually added by us in Square customer profile)
    const squareClientNote = clientNoteBySquareId.get(b.square_booking_id) ?? "";

    const match = existingClients?.find(cl => {
      if (cl.booking_id === b.id) return true;
      const samePhone = bPhone && normP(cl.phone) === bPhone;
      const sameEmail = b.email && cl.email === b.email;
      return (samePhone || sameEmail) && cl.visit_date === b.date;
    });
    if (!match) {
      const parts = (b.name ?? "").trim().split(/\s+/);
      await db.from("clients").insert({
        first_name:  parts[0] ?? b.name ?? "",
        last_name:   parts.slice(1).join(" ") || "",
        phone:       b.phone ?? "",
        email:       b.email ?? "",
        visit_date:  b.date,
        notes:       squareClientNote,
        owner:       "main",
        booking_id:  b.id,
      });
      logEntries.push({ ts: now_ts, type: "client", name: b.name ?? "", sub: `New client · ${b.date}` });
      clientsSynced++;
    } else if (squareClientNote && !match.notes) {
      // Fill in empty notes from Square client profile note (don't overwrite existing admin notes)
      await db.from("clients").update({ notes: squareClientNote }).eq("id", match.id);
    }
  }

  // Write sync log if anything new was added
  if (logEntries.length > 0) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/sync-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY}` },
      body: JSON.stringify(logEntries),
    }).catch(() => {/* non-fatal */});
  }

  // ── Auto-link bookings to member profiles by phone / email ──────────────────
  // Find bookings with no member_id but a known phone or email, match against profiles
  const { data: unlinked } = await db
    .from("bookings")
    .select("id, phone, email")
    .is("member_id", null)
    .not("status", "eq", "cancelled");

  if (unlinked && unlinked.length > 0) {
    // Fetch all profiles with phone or email set
    const { data: profiles } = await db
      .from("profiles")
      .select("id, phone")
      .not("phone", "is", null);

    const phoneToMember = new Map<string, string>();
    for (const p of profiles ?? []) {
      const n = normP(p.phone ?? "");
      if (n) phoneToMember.set(n, p.id);
    }

    const emailToMember = new Map<string, string>();
    try {
      let page = 1;
      while (true) {
        const { data } = await db.auth.admin.listUsers({ perPage: 1000, page });
        for (const u of data?.users ?? []) {
          if (u.email) emailToMember.set(u.email, u.id);
        }
        if (!data?.users?.length || data.users.length < 1000) break;
        page++;
      }
    } catch { /* non-fatal */ }

    let linked = 0;
    for (const b of unlinked as { id: string; phone: string; email: string }[]) {
      const ph = normP(b.phone ?? "");
      const memberId = (ph && phoneToMember.get(ph)) || (b.email && emailToMember.get(b.email)) || null;
      if (!memberId) continue;
      await db.from("bookings").update({ member_id: memberId }).eq("id", b.id);
      linked++;
    }

    if (linked > 0) {
      // Refresh visit stats for affected members
      const { data: linkedBookings } = await db
        .from("bookings")
        .select("member_id, date")
        .not("member_id", "is", null)
        .neq("status", "cancelled");

      const memberVisits = new Map<string, string[]>();
      for (const b of linkedBookings ?? []) {
        const id = b.member_id as string;
        if (!memberVisits.has(id)) memberVisits.set(id, []);
        memberVisits.get(id)!.push(b.date as string);
      }
      for (const [memberId, dates] of memberVisits) {
        const sorted = dates.sort();
        const v = dates.length;
        const vip_tier = v >= 20 ? "diamond" : v >= 10 ? "gold" : v >= 5 ? "silver" : "member";
        await db.from("profiles").update({
          total_visits_all_time: v,
          last_visit_date: sorted[sorted.length - 1],
          vip_tier,
        }).eq("id", memberId);
      }
    }
  }

  return NextResponse.json({ synced, total: unique.length, clientsSynced });
}

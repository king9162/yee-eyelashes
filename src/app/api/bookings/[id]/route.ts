import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { cancelSquareBooking, updateSquareBooking } from "@/lib/square";
import { createCalendarEvent } from "@/lib/google-calendar";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id }  = await params;
  const body    = await req.json();
  const db      = supabaseAdmin();

  // ── Clear send timestamps (review_sent_at / refill_sent_at) ────────────
  if ("review_sent_at" in body || "refill_sent_at" in body) {
    const fields: Record<string, unknown> = {};
    if ("review_sent_at" in body) fields.review_sent_at = body.review_sent_at ?? null;
    if ("refill_sent_at" in body) fields.refill_sent_at = body.refill_sent_at ?? null;
    const { error } = await db.from("bookings").update(fields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Reschedule (date/time change) ────────────────────────────────────────
  if (body.date || body.time) {
    const { data: existing } = await db.from("bookings").select("*").eq("id", id).single();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newDate = body.date ?? existing.date;
    const newTime = body.time ?? existing.time;
    const updateFields: Record<string, unknown> = { date: newDate, time: newTime };
    if (body.name          !== undefined) updateFields.name          = body.name;
    if (body.phone         !== undefined) updateFields.phone         = body.phone;
    if (body.email         !== undefined) updateFields.email         = body.email;
    if (body.service_label !== undefined) updateFields.service_label = body.service_label;
    if (body.duration_min  !== undefined) updateFields.duration_min  = body.duration_min;
    if (body.notes         !== undefined) updateFields.notes         = body.notes;

    const { error } = await db.from("bookings").update(updateFields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Revenue placeholder: move from old date to new date when date changes
    if (newDate !== existing.date && existing.name) {
      const newClientName = (body.name as string | undefined) ?? existing.name;
      await db.from("revenue_entries")
        .delete()
        .eq("date", existing.date)
        .eq("client_name", existing.name)
        .eq("amount", 0)
        .is("square_payment_id", null);
      const { data: existingRev } = await db.from("revenue_entries")
        .select("id")
        .eq("date", newDate)
        .eq("client_name", newClientName)
        .maybeSingle();
      if (!existingRev) {
        await db.from("revenue_entries").insert({
          date:           newDate,
          client_name:    newClientName,
          service_label:  (body.service_label as string | undefined) ?? existing.service_label ?? "",
          amount:         0,
          tip:            0,
          payment_method: "cash",
        });
      }
    }

    if (!body.skipSquare) {
      // Update Google Calendar: delete old + create new
      try {
        if (existing.calendar_event_id) await deleteCalendarEvent(existing.calendar_event_id);
        const newEventId = await createCalendarEvent({
          summary:       `${existing.service_label} — ${existing.name}`,
          description:   `Client: ${existing.name}\nPhone: ${existing.phone}\nEmail: ${existing.email}${existing.notes ? `\nNotes: ${existing.notes}` : ""}`,
          date:          newDate,
          time:          newTime,
          durationMin:   existing.duration_min ?? 90,
          attendeeEmail: existing.email,
          attendeeName:  existing.name,
        });
        if (newEventId) await db.from("bookings").update({ calendar_event_id: newEventId }).eq("id", id);
      } catch (e) { console.error("Calendar update error (non-fatal):", e); }

      // Update Square
      try {
        if (existing.square_booking_id) await updateSquareBooking(existing.square_booking_id, newDate, newTime);
      } catch (e) { console.error("Square update error (non-fatal):", e); }
    }

    return NextResponse.json({ success: true });
  }

  // ── Service label update ─────────────────────────────────────────────────
  if (body.service_label !== undefined && Object.keys(body).length === 1) {
    const { error } = await db.from("bookings").update({ service_label: body.service_label }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Merge square_booking_id (internal sync use) ─────────────────────────
  if (body.square_booking_id !== undefined) {
    const fields: Record<string, unknown> = { square_booking_id: body.square_booking_id };
    if (body.service_label) fields.service_label = body.service_label;
    if (body.duration_min)  fields.duration_min  = body.duration_min;
    const { error } = await db.from("bookings").update(fields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Status change ────────────────────────────────────────────────────────
  const { status } = body;
  if (!["pending", "confirmed", "cancelled", "noshow"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Fetch booking info before update (needed for revenue cleanup)
  const { data: bookingInfo } = await db.from("bookings").select("date, name, calendar_event_id, square_booking_id").eq("id", id).single();

  const { error } = await db.from("bookings").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When cancelled: delete $0 revenue placeholder for this booking
  if (status === "cancelled" && bookingInfo?.date && bookingInfo?.name) {
    await db.from("revenue_entries")
      .delete()
      .eq("date", bookingInfo.date)
      .eq("client_name", bookingInfo.name)
      .eq("amount", 0)
      .is("square_payment_id", null);
  }

  // Delete calendar + Square when cancelled (skip if admin-only cancel)
  if (status === "cancelled" && !body.skipSquare) {
    try {
      if (bookingInfo?.calendar_event_id) await deleteCalendarEvent(bookingInfo.calendar_event_id);
      if (bookingInfo?.square_booking_id) await cancelSquareBooking(bookingInfo.square_booking_id);
    } catch { /* non-fatal */ }
  }

  // Send confirmation email to client when admin confirms
  if (status === "confirmed") {
    try {
      const { data: booking } = await db.from("bookings").select("*").eq("id", id).single();
      if (booking) {
        await sendConfirmationEmail({
          name:         booking.name,
          email:        booking.email,
          phone:        booking.phone,
          service:      booking.service,
          serviceLabel: booking.service_label,
          date:         booking.date,
          time:         booking.time,
          notes:        booking.notes,
        });
      }
    } catch (emailErr) {
      console.error("Confirm email error (non-fatal):", emailErr);
    }

    // Immediately sync revenue so new confirmed booking appears in Revenue
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/revenue/sync-square`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY}` },
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = supabaseAdmin();

  // Fetch IDs before deleting
  const { data: booking } = await db.from("bookings").select("calendar_event_id, square_booking_id").eq("id", id).single();

  const { error } = await db.from("bookings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clean up Google Calendar and Square
  try { if (booking?.calendar_event_id) await deleteCalendarEvent(booking.calendar_event_id); } catch { /* non-fatal */ }
  try { if (booking?.square_booking_id) await cancelSquareBooking(booking.square_booking_id); } catch { /* non-fatal */ }

  return NextResponse.json({ success: true });
}

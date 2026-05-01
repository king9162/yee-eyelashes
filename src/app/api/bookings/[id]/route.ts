import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { cancelSquareBooking } from "@/lib/square";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id }     = await params;
  const { status } = await req.json();
  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db.from("bookings").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Delete calendar + Square when cancelled
  if (status === "cancelled") {
    try {
      const { data: booking } = await db.from("bookings").select("calendar_event_id, square_booking_id").eq("id", id).single();
      if (booking?.calendar_event_id) await deleteCalendarEvent(booking.calendar_event_id);
      if (booking?.square_booking_id) await cancelSquareBooking(booking.square_booking_id);
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

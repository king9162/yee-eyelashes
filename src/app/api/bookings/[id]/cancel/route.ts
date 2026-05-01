import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateCancelToken, sendCancellationEmail, sendBettyCancellationNotification } from "@/lib/email";
import { deleteCalendarEvent } from "@/lib/google-calendar";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { token, lang } = await req.json();

  if (!id || !token || token !== generateCancelToken(id)) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: booking, error } = await db
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 409 });
  }

  // Mark as cancelled
  const { error: updateError } = await db
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }

  // Delete Google Calendar event
  if (booking.calendar_event_id) {
    try {
      await deleteCalendarEvent(booking.calendar_event_id);
    } catch { /* non-fatal */ }
  }

  const emailData = {
    name:         booking.name,
    email:        booking.email,
    phone:        booking.phone,
    service:      booking.service,
    serviceLabel: booking.service_label,
    date:         booking.date,
    time:         booking.time,
    notes:        booking.notes,
    lang:         lang ?? "en",
  };

  // Send cancellation emails
  try {
    await sendCancellationEmail(emailData);
  } catch (e) {
    console.error("Cancellation email error (non-fatal):", e);
  }

  try {
    await sendBettyCancellationNotification(emailData);
  } catch (e) {
    console.error("Betty cancellation notification error (non-fatal):", e);
  }

  return NextResponse.json({ success: true });
}

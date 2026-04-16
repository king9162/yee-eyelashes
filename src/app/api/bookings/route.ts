import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin }       from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";
import { createCalendarEvent }   from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, serviceLabel, date, time, notes } = body;

    // ── Validate ──────────────────────────────────────────────
    if (!name || !phone || !email || !service || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // ── 1. Save to Supabase ───────────────────────────────────
    const { data: booking, error: dbError } = await db
      .from("bookings")
      .insert({ name, phone, email, service, service_label: serviceLabel, date, time, notes, status: "pending" })
      .select()
      .single();

    if (dbError) throw dbError;

    // ── 2. Google Calendar event ──────────────────────────────
    let calendarEventId: string | null = null;
    try {
      calendarEventId = await createCalendarEvent({
        summary:       `${serviceLabel} — ${name}`,
        description:   `Client: ${name}\nPhone: ${phone}\nEmail: ${email}${notes ? `\nNotes: ${notes}` : ""}`,
        date,
        time,
        durationMin:   90,
        attendeeEmail: email,
        attendeeName:  name,
      });

      // Update booking with calendar event ID
      await db.from("bookings").update({ calendar_event_id: calendarEventId }).eq("id", booking.id);
    } catch (calErr) {
      console.error("Google Calendar error (non-fatal):", calErr);
    }

    // ── 3. Send confirmation email ────────────────────────────
    try {
      await sendConfirmationEmail({ name, phone, email, service, serviceLabel, date, time, notes });
    } catch (emailErr) {
      console.error("Email error (non-fatal):", emailErr);
    }

    return NextResponse.json({ success: true, bookingId: booking.id });

  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── GET: Admin fetch all bookings ─────────────────────────────
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("bookings")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

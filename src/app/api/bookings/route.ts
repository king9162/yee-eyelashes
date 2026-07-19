import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin }       from "@/lib/supabase";
import { sendConfirmationEmail, sendBettyNotification } from "@/lib/email";
import { createCalendarEvent }   from "@/lib/google-calendar";
import { createSquareBooking }   from "@/lib/square";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, serviceKey, serviceLabel, date, time, notes, duration, lang } = body;

    function parseDurationMin(d: string): number {
      let mins = 0;
      const hr  = d?.match(/(\d+)hr/);
      const min = d?.match(/(\d+)min/);
      if (hr)  mins += parseInt(hr[1]) * 60;
      if (min) mins += parseInt(min[1]);
      return mins || 90;
    }
    const durationMin = parseDurationMin(duration);

    // ── Validate ──────────────────────────────────────────────
    if (!name || !phone || !email || !service || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Honeypot — bots fill this, humans don't
    if (body.website) {
      return NextResponse.json({ success: true }); // silently drop
    }

    // Format validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dateRe  = /^\d{4}-\d{2}-\d{2}$/;
    if (!emailRe.test(email))  return NextResponse.json({ error: "Invalid email" },  { status: 400 });
    if (!dateRe.test(date))    return NextResponse.json({ error: "Invalid date" },   { status: 400 });
    if (new Date(date) < new Date(new Date().toDateString())) {
      return NextResponse.json({ error: "Date must be in the future" }, { status: 400 });
    }

    // Length limits
    if (name.length > 100 || phone.length > 30 || email.length > 200 || (notes && notes.length > 1000)) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // Sanitize
    const clean = (s: string) => s.trim().replace(/[<>]/g, "");
    const safeName  = clean(name);
    const safePhone = clean(phone);
    const safeNotes = notes ? clean(notes) : null;

    const db = supabaseAdmin();

    // ── 1. Save to Supabase ───────────────────────────────────
    const { data: booking, error: dbError } = await db
      .from("bookings")
      .insert({ name: safeName, phone: safePhone, email, service, service_label: serviceLabel, date, time, notes: safeNotes, status: "pending", duration_min: durationMin })
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
        durationMin:   durationMin,
        attendeeEmail: email,
        attendeeName:  name,
      });

      // Update booking with calendar event ID
      await db.from("bookings").update({ calendar_event_id: calendarEventId }).eq("id", booking.id);
    } catch (calErr) {
      console.error("Google Calendar error (non-fatal):", calErr);
    }

    // ── 3. Sync to Square Appointments ───────────────────────
    try {
      const squareBookingId = await createSquareBooking({
        serviceKey: serviceKey ?? `${service}-only`,
        durationMin,
        date,
        time,
        customerName: safeName,
        customerEmail: email,
        customerPhone: safePhone,
        notes: safeNotes,
      });
      if (squareBookingId) {
        await db.from("bookings").update({ square_booking_id: squareBookingId }).eq("id", booking.id);
      }
    } catch (sqErr) {
      console.error("Square booking error (non-fatal):", sqErr);
    }

    // ── 4. Send confirmation email to client ─────────────────
    // Skip for admin-created bookings (service="admin") — the PATCH to "confirmed" sends it
    if (service !== "admin") {
      try {
        await sendConfirmationEmail({ name, phone, email, service, serviceLabel, date, time, notes, lang, bookingId: booking.id });
      } catch (emailErr) {
        console.error("Email error (non-fatal):", emailErr);
      }
    }

    // ── 5. Notify Betty ───────────────────────────────────────
    try {
      await sendBettyNotification({ name, phone, email, service, serviceLabel, date, time, notes });
    } catch (notifyErr) {
      console.error("Betty notification error (non-fatal):", notifyErr);
    }

    // ── 6. Sync client to My Clients panel ───────────────────
    try {
      const nameParts  = safeName.trim().split(/\s+/);
      const firstName  = nameParts[0] ?? safeName;
      const lastName   = nameParts.slice(1).join(" ") || null;
      await db.from("clients").insert({
        first_name:  firstName,
        last_name:   lastName,
        phone:       safePhone,
        email,
        visit_date:  date,
        notes:       safeNotes,
        booking_id:  booking.id,
      });
    } catch (clientErr) {
      console.error("Client sync error (non-fatal):", clientErr);
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

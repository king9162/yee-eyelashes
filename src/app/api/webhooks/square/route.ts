import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendConfirmationEmail, sendBettyNotification, sendBettyCancellationNotification, sendBettyRescheduleNotification } from "@/lib/email";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendSMS } from "@/lib/sms";

// Square requires raw body for signature verification
export const dynamic = "force-dynamic";

function verifySignature(body: string, signature: string, url: string): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
  const expected = createHmac("sha256", key)
    .update(url + body)
    .digest("base64");
  return signature === expected;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";

  // Use the exact URL Square sent to (avoids www vs non-www mismatch)
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const url = `${proto}://${host}/api/webhooks/square`;

  if (!verifySignature(body, signature, url)) {
    // Fallback: try with NEXT_PUBLIC_SITE_URL
    const fallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/square`;
    if (!verifySignature(body, signature, fallbackUrl)) {
      console.error("Square webhook: invalid signature", { url, fallbackUrl });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const event = JSON.parse(body);
  const eventType: string = event.type ?? "";

  // ── Square Appointment cancelled ──────────────────────────────
  if (eventType === "booking.cancelled") {
    const squareBooking = event.data?.object?.booking;
    const squareBookingId: string | undefined = squareBooking?.id;
    if (squareBookingId) {
      try {
        const db = supabaseAdmin();
        const { data: existing } = await db.from("bookings")
          .select("*")
          .eq("square_booking_id", squareBookingId)
          .maybeSingle();

        if (existing && existing.status !== "cancelled") {
          await db.from("bookings")
            .update({ status: "cancelled" })
            .eq("square_booking_id", squareBookingId);

          try {
            await sendBettyCancellationNotification({
              name:         existing.name,
              email:        existing.email,
              phone:        existing.phone,
              service:      existing.service ?? "square",
              serviceLabel: existing.service_label ?? "",
              date:         existing.date,
              time:         existing.time,
            });
          } catch (emailErr) { console.error("Cancel notify error (non-fatal):", emailErr); }
        }
      } catch (err) {
        console.error("booking.cancelled sync error:", err);
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── Square Appointment booked → auto-sync client ──────────────
  if (eventType === "booking.created" || eventType === "booking.updated") {
    const booking = event.data?.object?.booking;
    if (!booking) return NextResponse.json({ ok: true });

    // If the updated booking is now cancelled, handle it the same as booking.cancelled
    const squareStatus = ((booking.status as string) ?? "").toUpperCase();
    if (eventType === "booking.updated" && squareStatus.includes("CANCEL")) {
      const squareBookingId: string | undefined = booking.id;
      if (squareBookingId) {
        try {
          const db = supabaseAdmin();
          const { data: existing } = await db.from("bookings")
            .select("*")
            .eq("square_booking_id", squareBookingId)
            .maybeSingle();

          if (existing && existing.status !== "cancelled") {
            await db.from("bookings")
              .update({ status: "cancelled" })
              .eq("square_booking_id", squareBookingId);

            try {
              await sendBettyCancellationNotification({
                name:         existing.name,
                email:        existing.email,
                phone:        existing.phone,
                service:      existing.service ?? "square",
                serviceLabel: existing.service_label ?? "",
                date:         existing.date,
                time:         existing.time,
              });
            } catch (emailErr) { console.error("Cancel notify error (non-fatal):", emailErr); }
          }
        } catch (err) { console.error("booking.updated cancel sync error:", err); }
      }
      return NextResponse.json({ ok: true });
    }

    const customerId: string | undefined = booking.customer_id;
    if (!customerId) return NextResponse.json({ ok: true });

    try {
      // Fetch customer details from Square
      const customerRes = await fetch(
        `https://connect.squareup.com/v2/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}` } }
      );
      const customerData = await customerRes.json();
      const c = customerData.customer;
      if (!c) return NextResponse.json({ ok: true });

      const firstName       = c.given_name   ?? "";
      const lastName        = c.family_name  ?? "";
      const phone           = c.phone_number ?? "";
      const email           = c.email_address ?? "";
      // Square "Client notes" — manually added by us on the customer profile
      const squareClientNote = (c.note as string | undefined) ?? "";
      const visitDate   = booking.start_at
        ? new Date(booking.start_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" })
        : "";
      const durationMin = booking.appointment_segments?.[0]?.duration_minutes ?? 60;

      const db = supabaseAdmin();

      const phoneDigits = phone.replace(/\D/g, "").slice(-10);

      // Insert a new client row for each appointment (same as manual bookings)
      // Check for exact duplicate: same phone + same visit date
      const { data: allClients } = await db.from("clients").select("id, phone, email, visit_date, notes");
      const existingClient = allClients?.find(cl => {
        const samePhone = phoneDigits && cl.phone?.replace(/\D/g, "").slice(-10) === phoneDigits;
        const sameEmail = email && cl.email === email;
        return (samePhone || sameEmail) && cl.visit_date === visitDate;
      });

      if (!existingClient) {
        await db.from("clients").insert({
          first_name:  firstName,
          last_name:   lastName,
          phone,
          email,
          visit_date:  visitDate,
          notes:       squareClientNote,
          owner:       "main",
        });
      } else if (squareClientNote && !existingClient.notes) {
        await db.from("clients").update({ notes: squareClientNote }).eq("id", existingClient.id);
      }

      // Sync to bookings table (for admin calendar)
      const squareBookingId: string = booking.id ?? "";
      const bookingTime = booking.start_at
        ? new Date(booking.start_at).toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
          })
        : "";
      // Fetch real service name from catalog
      let serviceLabel = booking.appointment_segments?.[0]?.service_variation_name ?? "";
      const varId = booking.appointment_segments?.[0]?.service_variation_id as string | undefined;
      if (!serviceLabel && varId) {
        try {
          const catRes = await fetch(`https://connect.squareup.com/v2/catalog/object/${varId}`, {
            headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": "2024-01-18" },
          });
          if (catRes.ok) {
            const catData = await catRes.json();
            serviceLabel = catData.object?.item_variation_data?.name ?? "";
          }
        } catch { /* non-fatal */ }
      }
      if (!serviceLabel) serviceLabel = `${durationMin} min`;
      const fullName = `${firstName} ${lastName}`.trim();

      if (eventType === "booking.created" && squareBookingId) {
        const { data: existingBooking } = await db
          .from("bookings")
          .select("id")
          .eq("square_booking_id", squareBookingId)
          .maybeSingle();

        if (!existingBooking) {
          await db.from("bookings").insert({
            name:             fullName,
            phone,
            email,
            service:          "square",
            service_label:    serviceLabel,
            date:             visitDate,
            time:             bookingTime,
            status:           "confirmed",
            duration_min:     durationMin,
            notes:            "",
            square_booking_id: squareBookingId,
          });
          // Log this new booking
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/sync-log`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY}` },
            body: JSON.stringify([{ ts: new Date().toISOString(), type: "booking", name: fullName, sub: `${visitDate} ${bookingTime} · ${serviceLabel}` }]),
          }).catch(() => {/* non-fatal */});

          // Notify Betty — only for Square-app bookings (website bookings already notified in /api/bookings)
          try {
            await sendBettyNotification({
              name:         fullName,
              email:        email || "—",
              phone:        phone || "—",
              service:      "square",
              serviceLabel: serviceLabel || `Square Appointment (${durationMin} min)`,
              date:         visitDate,
              time:         bookingTime,
            });
          } catch (err) { console.error("Betty notify error (non-fatal):", err); }
        }
      } else if (eventType === "booking.updated" && squareBookingId) {
        const { data: existingBooking } = await db
          .from("bookings")
          .select("date, time, service_label")
          .eq("square_booking_id", squareBookingId)
          .maybeSingle();

        await db.from("bookings").update({
          service_label: serviceLabel,
          date:          visitDate,
          time:          bookingTime,
          duration_min:  durationMin,
        }).eq("square_booking_id", squareBookingId);

        // Notify Betty if the date or time actually changed
        if (existingBooking && (existingBooking.date !== visitDate || existingBooking.time !== bookingTime)) {
          try {
            await sendBettyRescheduleNotification({
              name:         fullName,
              phone:        phone || "—",
              email:        email || "—",
              serviceLabel: serviceLabel,
              oldDate:      existingBooking.date,
              oldTime:      existingBooking.time,
              newDate:      visitDate,
              newTime:      bookingTime,
            });
          } catch (err) { console.error("Reschedule notify error (non-fatal):", err); }
        }
      }

    } catch (err) {
      console.error("booking.created sync error:", err);
    }
    return NextResponse.json({ ok: true });
  }

  // payment.updated fires when a payment transitions state;
  // we only act when it reaches COMPLETED
  if (eventType === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (!payment || payment.status !== "COMPLETED") {
      return NextResponse.json({ ok: true });
    }

    try {
      const db = supabaseAdmin();
      const orderId: string | undefined = payment.order_id;
      const squarePaymentId: string | undefined = payment.id;

      let booking: Record<string, string> | null = null;

      // Look up booking by the Square order ID we stored at checkout
      if (orderId) {
        const { data } = await db
          .from("bookings")
          .select("*")
          .eq("square_order_id", orderId)
          .single();
        booking = data;
      }

      if (!booking) {
        console.error("Square webhook: booking not found for order_id", orderId);
        return NextResponse.json({ ok: true });
      }

      // Idempotency guard: skip if already paid
      if (booking.payment_status === "paid") {
        return NextResponse.json({ ok: true });
      }

      // Mark booking as paid
      await db
        .from("bookings")
        .update({
          status: "pending",
          payment_status: "paid",
          square_payment_id: squarePaymentId ?? null,
        })
        .eq("id", booking.id);

      // Create Google Calendar event
      try {
        const durationMin = booking.duration_min ? parseInt(booking.duration_min) : 90;
        const calendarEventId = await createCalendarEvent({
          summary: `${booking.service_label} — ${booking.name}`,
          description: `Client: ${booking.name}\nPhone: ${booking.phone}\nEmail: ${booking.email}${booking.notes ? `\nNotes: ${booking.notes}` : ""}`,
          date: booking.date,
          time: booking.time,
          durationMin,
          attendeeEmail: booking.email,
          attendeeName: booking.name,
        });
        await db
          .from("bookings")
          .update({ calendar_event_id: calendarEventId })
          .eq("id", booking.id);
      } catch (err) {
        console.error("Calendar error (non-fatal):", err);
      }

      // Send confirmation email to client
      try {
        await sendConfirmationEmail({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          service: booking.service,
          serviceLabel: booking.service_label,
          date: booking.date,
          time: booking.time,
          notes: booking.notes ?? undefined,
        });
      } catch (err) {
        console.error("Email error (non-fatal):", err);
      }

      // Notify Betty
      try {
        await sendBettyNotification({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          service: booking.service,
          serviceLabel: booking.service_label,
          date: booking.date,
          time: booking.time,
          notes: booking.notes ?? undefined,
        });
      } catch (err) {
        console.error("Betty notification error (non-fatal):", err);
      }

      // SMS to client
      try {
        const [y, m, d] = booking.date.split("-");
        const friendlyDate = `${m}/${d}/${y}`;
        await sendSMS(
          booking.phone,
          `Hi ${booking.name}! ✨ Your Yee Eyelashes appointment has been confirmed.\n\nService: ${booking.service_label}\nDate: ${friendlyDate} at ${booking.time}\n📍 278 Plandome Rd, 2nd Floor, Manhasset, NY\n📞 929-806-2467\n\nSee you soon!`
        );
      } catch (err) {
        console.error("Client SMS error (non-fatal):", err);
      }

      // SMS to Betty
      try {
        await sendSMS(
          process.env.BETTY_PHONE_NUMBER!,
          `🔔 New Booking!\nService: ${booking.service_label}\nClient: ${booking.name}\nDate: ${booking.date} at ${booking.time}\nPhone: ${booking.phone}\nEmail: ${booking.email}`
        );
      } catch (err) {
        console.error("Betty SMS error (non-fatal):", err);
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

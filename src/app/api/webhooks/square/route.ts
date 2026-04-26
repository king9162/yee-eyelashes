import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendConfirmationEmail, sendBettyNotification } from "@/lib/email";
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
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/square`;

  if (!verifySignature(body, signature, url)) {
    console.error("Square webhook: invalid signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType: string = event.type ?? "";

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
          `Hi ${booking.name}! ✨ Your Yee Eyelashes appointment has been confirmed.\n\nService: ${booking.service_label}\nDate: ${friendlyDate} at ${booking.time}\n📍 278 Plandome Rd 2FL, Manhasset, NY\n📞 929-806-2467\n\nSee you soon!`
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

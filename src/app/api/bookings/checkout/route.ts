import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSquareClient } from "@/lib/square";

function getDepositCents(price: number): bigint {
  if (price <= 40)  return BigInt(Math.round(price * 100)); // full amount
  if (price <= 120) return BigInt(3000);                    // $30
  return BigInt(4000);                                      // $40
}

function parseDurationMin(d: string): number {
  let mins = 0;
  const hr  = d?.match(/(\d+)hr/);
  const min = d?.match(/(\d+)min/);
  if (hr)  mins += parseInt(hr[1]) * 60;
  if (min) mins += parseInt(min[1]);
  return mins || 90;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, serviceLabel, date, time, notes, duration, lang, website } = body;

    // Honeypot — bots fill this, humans don't
    if (website) {
      return NextResponse.json({ checkoutUrl: `/${lang ?? "en"}/booking/success` });
    }

    if (!name || !phone || !email || !service || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic format validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dateRe  = /^\d{4}-\d{2}-\d{2}$/;
    if (!emailRe.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!dateRe.test(date))   return NextResponse.json({ error: "Invalid date" },  { status: 400 });

    // Length limits
    if (name.length > 100 || phone.length > 30 || email.length > 200 || (notes && notes.length > 1000)) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    const clean = (s: string) => s.trim().replace(/[<>]/g, "");
    const safeName  = clean(name);
    const safePhone = clean(phone);
    const safeNotes = notes ? clean(notes) : null;
    const durationMin = parseDurationMin(duration);

    const db = supabaseAdmin();

    // 1. Save pending booking to Supabase
    const { data: booking, error: dbError } = await db
      .from("bookings")
      .insert({
        name: safeName, phone: safePhone, email, service, service_label: serviceLabel,
        date, time, notes: safeNotes,
        duration_min: durationMin,
        status: "pending_payment",
        payment_status: "pending",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Create Square payment link with tiered deposit
    const { amount: bodyAmount } = body;
    const servicePrice = typeof bodyAmount === "number" ? bodyAmount : 0;
    const depositCents = getDepositCents(servicePrice);
    const depositDollars = Number(depositCents) / 100;
    const isFullPayment = servicePrice <= 40;

    const square = getSquareClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yeelashesny.com";
    const successLang = lang ?? "en";

    const lineItemName = isFullPayment
      ? serviceLabel
      : `Deposit — ${serviceLabel}`;
    const lineItemNote = isFullPayment
      ? undefined
      : "Non-refundable within 24 hrs. Remaining balance due at appointment.";

    const response = await square.checkout.paymentLinks.create({
      idempotencyKey: booking.id,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: [
          {
            name: lineItemName,
            quantity: "1",
            basePriceMoney: {
              amount: depositCents,
              currency: "USD",
            },
            note: lineItemNote,
          },
        ],
        metadata: { booking_id: booking.id },
      },
      checkoutOptions: {
        redirectUrl: `${baseUrl}/${successLang}/booking/success?id=${booking.id}`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: email,
      },
    });

    const checkoutUrl = response.paymentLink?.url;
    if (!checkoutUrl) throw new Error("No checkout URL returned from Square");

    // 3. Store checkout ID and order ID in booking
    await db
      .from("bookings")
      .update({
        square_checkout_id: response.paymentLink?.id,
        square_order_id: response.paymentLink?.orderId ?? null,
      })
      .eq("id", booking.id);

    return NextResponse.json({ checkoutUrl, depositDollars, isFullPayment });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

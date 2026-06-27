import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey   = process.env.GOOGLE_PLACES_API_KEY;
  const placeId  = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not set" }, { status: 500 });
  }

  // Fetch latest reviews from Google Places API
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}&language=en`
  );
  if (!res.ok) return NextResponse.json({ error: "Places API error" }, { status: 500 });

  const data = await res.json();
  if (data.status !== "OK") {
    return NextResponse.json({ error: data.status, message: data.error_message }, { status: 500 });
  }

  const googleReviews: { author_name: string; rating: number; text: string; time: number }[] =
    data.result?.reviews ?? [];
  const userRatingsTotal: number = data.result?.user_ratings_total ?? 0;

  const db = supabaseAdmin();

  // Detect review deletions by tracking total count
  const { data: storedCount } = await db.from("settings").select("value").eq("key", "google_ratings_total").maybeSingle();
  const prevTotal = parseInt(storedCount?.value ?? "0") || 0;

  if (userRatingsTotal > 0) {
    await db.from("settings").upsert({ key: "google_ratings_total", value: String(userRatingsTotal) }, { onConflict: "key" });
  }

  if (prevTotal > 0 && userRatingsTotal < prevTotal) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "booking@yeeeyelashes.com",
      to:      "yeelashesny@gmail.com",
      subject: "⚠️ Google Review Deleted — Yee Eyelashes",
      text:    `A Google review may have been deleted.\n\nPrevious total: ${prevTotal}\nCurrent total: ${userRatingsTotal}\n\nPlease check your Google Business profile:\nhttps://business.google.com\n\nView admin: https://www.yeeeyelashes.com/admin`,
    }).catch(e => console.error("Alert email error:", e));
  }

  const { data: existing } = await db.from("reviews").select("reviewer_name, review_text");

  const existingSet = new Set(
    (existing ?? []).map(r => `${r.reviewer_name?.toLowerCase()}|${(r.review_text ?? "").slice(0, 50).toLowerCase()}`)
  );

  const newReviews = googleReviews.filter(gr => {
    const key = `${gr.author_name.toLowerCase()}|${(gr.text ?? "").slice(0, 50).toLowerCase()}`;
    return !existingSet.has(key);
  });

  // Insert new reviews
  for (const gr of newReviews) {
    const date = new Date(gr.time * 1000).toISOString().split("T")[0];
    await db.from("reviews").insert({
      reviewer_name: gr.author_name,
      rating:        gr.rating,
      review_date:   date,
      review_text:   gr.text ?? "",
      platform:      "google",
      responded:     false,
    });
  }

  // Send email alert if new reviews found
  if (newReviews.length > 0) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const list = newReviews.map(r => `• ${r.author_name} (${r.rating}★): ${r.text?.slice(0, 100) ?? ""}...`).join("\n");
    await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "booking@yeeeyelashes.com",
      to:      "yeelashesny@gmail.com",
      subject: `New Google Review${newReviews.length > 1 ? "s" : ""} — Yee Eyelashes`,
      text:    `You have ${newReviews.length} new Google review${newReviews.length > 1 ? "s" : ""}:\n\n${list}\n\nView in admin: https://www.yeeeyelashes.com/admin`,
    });
  }

  return NextResponse.json({ checked: googleReviews.length, added: newReviews.length });
}

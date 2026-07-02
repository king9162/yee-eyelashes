import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const [r1, r2] = await Promise.all([
    db.from("bookings").update({ review_sent_at: null }).not("review_sent_at", "is", null),
    db.from("bookings").update({ refill_sent_at: null }).not("refill_sent_at", "is", null),
  ]);
  return NextResponse.json({ review_cleared: !r1.error, refill_cleared: !r2.error });
}

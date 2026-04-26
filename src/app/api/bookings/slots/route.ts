import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALL_TIMES = [
  "9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM",
];

function toMin(t: string): number {
  const [hhmm, period] = t.split(" ");
  let [h, m] = hhmm.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ bookedTimes: [] });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("bookings")
    .select("time, duration_min")
    .eq("date", date)
    .neq("status", "cancelled");

  if (error) return NextResponse.json({ bookedTimes: [] });

  const blocked = new Set<string>();
  for (const booking of data) {
    const startMin = toMin(booking.time);
    const durMin   = booking.duration_min ?? 90;
    for (const t of ALL_TIMES) {
      const tMin = toMin(t);
      // Block any slot that falls within this booking's duration
      if (tMin >= startMin && tMin < startMin + durMin) {
        blocked.add(t);
      }
    }
  }

  return NextResponse.json({ bookedTimes: Array.from(blocked) });
}

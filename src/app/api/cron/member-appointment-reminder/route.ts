import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendMemberAppointmentReminderEmail } from "@/lib/email";

function auth(req: NextRequest) {
  const h = req.headers.get("authorization") ?? "";
  return h === `Bearer ${process.env.ADMIN_SECRET_KEY}` || h === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();

  // Tomorrow's date in NY time
  const nyNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  nyNow.setDate(nyNow.getDate() + 1);
  const tomorrow = nyNow.toISOString().split("T")[0];

  // Get confirmed bookings for tomorrow with a linked member
  const { data: bookings } = await db
    .from("bookings")
    .select("id, name, service_label, date, time, member_id")
    .eq("date", tomorrow)
    .eq("status", "confirmed")
    .not("member_id", "is", null);

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0, date: tomorrow });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const booking of bookings) {
    const memberId = booking.member_id as string;
    try {
      const { data: authUser } = await db.auth.admin.getUserById(memberId);
      const email = authUser?.user?.email;
      if (!email) continue;

      const { data: profile } = await db
        .from("profiles")
        .select("first_name, notif_refill")
        .eq("id", memberId)
        .single();

      const name = (profile?.first_name as string | null) ?? (booking.name as string);

      await sendMemberAppointmentReminderEmail({
        name,
        email,
        serviceLabel: (booking.service_label as string) ?? "Appointment",
        date:         booking.date as string,
        time:         (booking.time as string) ?? "",
      });
      sent++;
    } catch (e) {
      errors.push(`${booking.name}: ${e}`);
    }
  }

  return NextResponse.json({ sent, date: tomorrow, errors });
}

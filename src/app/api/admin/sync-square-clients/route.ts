import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  // Get all Square bookings
  const { data: bookings, error: bookingsError } = await db
    .from("bookings")
    .select("*")
    .eq("service", "square");

  if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  if (!bookings?.length) return NextResponse.json({ synced: 0 });

  // Get all clients for comparison
  const { data: clients } = await db.from("clients").select("id, phone, email, visit_date");

  const normPhone = (p: string) => p?.replace(/\D/g, "").slice(-10) ?? "";

  let synced = 0;

  for (const b of bookings) {
    if (!b.date || (!b.phone && !b.email)) continue;

    const bPhone = normPhone(b.phone);

    // Check if client row with same phone + date already exists
    const exists = clients?.some(cl => {
      const samePhone = bPhone && normPhone(cl.phone) === bPhone;
      const sameEmail = b.email && cl.email === b.email;
      return (samePhone || sameEmail) && cl.visit_date === b.date;
    });

    if (!exists) {
      const nameParts = (b.name ?? "").trim().split(/\s+/);
      await db.from("clients").insert({
        first_name: nameParts[0] ?? b.name ?? "",
        last_name:  nameParts.slice(1).join(" ") || "",
        phone:      b.phone ?? "",
        email:      b.email ?? "",
        visit_date: b.date,
        notes:      "",
        owner:      "main",
      });
      synced++;
    }
  }

  return NextResponse.json({ synced });
}

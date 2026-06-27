import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/sync-square-bookings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}

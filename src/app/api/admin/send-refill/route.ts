import { NextRequest, NextResponse } from "next/server";
import { sendRefillReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, serviceLabel } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }

  try {
    await sendRefillReminderEmail({ name, email, phone: "", serviceLabel: serviceLabel ?? "your last service" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-refill error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

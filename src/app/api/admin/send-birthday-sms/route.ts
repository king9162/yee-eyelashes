import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 });
  }

  const digits = phone.replace(/\D/g, "");
  const e164 = digits.startsWith("1") ? `+${digits}` : `+1${digits}`;

  const bookUrl = "https://square.site/yee";
  const text = `🎂 Happy Birthday, ${name}! Celebrate with gorgeous lashes — enjoy 20% off any service this month at Yee Eyelashes 🎁 Book: ${bookUrl} 📍 278 Plandome Rd, Manhasset · 516-984-3859`;

  try {
    await sendSMS(e164, text);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-birthday-sms error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

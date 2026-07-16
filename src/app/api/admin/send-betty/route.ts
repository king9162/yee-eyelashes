import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { phone, message } = await req.json();
  const digits = (phone as string).replace(/\D/g, "");
  const e164 = digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
  await sendSMS(e164, message);
  return NextResponse.json({ ok: true });
}

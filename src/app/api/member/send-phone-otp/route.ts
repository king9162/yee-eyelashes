import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendSMS } from "@/lib/sms";

function signOtp(phone: string, code: string): string {
  const window = Math.floor(Date.now() / (10 * 60 * 1000));
  const secret = process.env.OTP_SECRET ?? process.env.ADMIN_SECRET_KEY ?? "";
  return crypto.createHmac("sha256", secret).update(`${phone}:${code}:${window}`).digest("hex");
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const token = signOtp(digits, code);

  try {
    await sendSMS(`+1${digits}`, `Your Yee Eyelashes verification code is ${code}. Valid for 10 minutes.`);
  } catch {
    return NextResponse.json({ error: "Failed to send SMS. Please check the phone number and try again." }, { status: 500 });
  }

  return NextResponse.json({ token });
}

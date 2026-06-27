import { NextRequest, NextResponse } from "next/server";
import { sendGoogleReviewEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }

  try {
    await sendGoogleReviewEmail({ name, email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-review error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

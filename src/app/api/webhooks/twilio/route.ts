import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { supabaseAdmin } from "@/lib/supabase";
import { todayNY } from "@/lib/date";

export const dynamic = "force-dynamic";

const STOP_WORDS = new Set(["stop","unsubscribe","cancel","end","quit","stopall"]);

export async function POST(req: NextRequest) {
  // Validate Twilio signature
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/webhooks/twilio`;

  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  if (authToken && signature) {
    const valid = twilio.validateRequest(authToken, signature, url, params);
    if (!valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const from  = (params.From ?? "").replace(/\D/g, "").slice(-10);
  const body  = (params.Body ?? "").trim().toLowerCase().split(/\s+/)[0];

  if (!STOP_WORDS.has(body)) {
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  if (!from) {
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const db = supabaseAdmin();
  // Find client by phone (try last 10 digits)
  const { data: clients } = await db
    .from("clients")
    .select("id, phone")
    .not("deleted", "eq", true);

  const matched = (clients ?? []).find(c => c.phone?.replace(/\D/g,"").slice(-10) === from);

  if (matched) {
    await db.from("client_actions").upsert(
      { client_id: matched.id, action_type: "sms-unsubscribed", sent_at: todayNY() },
      { onConflict: "client_id,action_type" }
    );
  }

  // Return empty TwiML response
  return new NextResponse('<?xml version="1.0"?><Response></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
}

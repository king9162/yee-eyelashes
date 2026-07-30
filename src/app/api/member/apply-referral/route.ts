import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { referral_code } = await req.json();
  if (!referral_code) return NextResponse.json({ error: "referral_code required" }, { status: 400 });

  const db = supabaseAdmin();

  // Find the referrer by code
  const { data: referrer } = await db
    .from("profiles")
    .select("id, first_name")
    .eq("referral_code", referral_code.toUpperCase())
    .single();

  if (!referrer) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  if (referrer.id === user.id) return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });

  // Check if already referred
  const { data: existing } = await db
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (existing?.referred_by) return NextResponse.json({ error: "Referral already applied" }, { status: 400 });

  // Check if referral record already exists
  const { data: existingRef } = await db
    .from("referrals")
    .select("id")
    .eq("referrer_id", referrer.id)
    .eq("referee_id", user.id)
    .limit(1);

  if (existingRef && existingRef.length > 0) {
    return NextResponse.json({ error: "Referral already exists" }, { status: 400 });
  }

  // Set referred_by on new member's profile
  await db.from("profiles").update({ referred_by: referrer.id }).eq("id", user.id);

  // Create referral record
  await db.from("referrals").insert({
    referrer_id: referrer.id,
    referee_id: user.id,
    status: "pending",
  });

  return NextResponse.json({ ok: true, referrer_name: referrer.first_name });
}

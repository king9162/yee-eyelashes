import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();

  const { data, error } = await db
    .from("referrals")
    .select(`
      id, status, created_at, referrer_rewarded_at,
      referrer:profiles!referrals_referrer_id_fkey(id, first_name, last_name, email),
      referee:profiles!referrals_referee_id_fkey(id, first_name, last_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

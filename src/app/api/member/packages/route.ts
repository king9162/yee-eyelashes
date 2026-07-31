import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const db = supabaseAdmin();

  const { data: profile } = await db
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .single();

  const phone10 = (profile?.phone ?? "").replace(/\D/g, "").slice(-10);
  if (phone10.length !== 10) return NextResponse.json([]);

  const { data, error } = await db
    .from("packages")
    .select("id, name, notes, purchase_date, use1_date, use2_date, use3_date, phone")
    .order("purchase_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter in code — packages.phone may have dashes/formatting
  const matched = (data ?? [])
    .filter(p => (p.phone ?? "").replace(/\D/g, "").slice(-10) === phone10)
    .map(({ phone: _phone, ...rest }) => rest);
  return NextResponse.json(matched);
}

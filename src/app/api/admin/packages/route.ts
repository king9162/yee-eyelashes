import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function auth(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("packages")
    .select("*")
    .order("purchase_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("packages")
    .insert([{
      name:          body.name,
      phone:         body.phone ?? null,
      notes:         body.notes ?? null,
      purchase_date: body.purchase_date ?? null,
      use1_date:     body.use1_date ?? null,
      use2_date:     body.use2_date ?? null,
      use3_date:     body.use3_date ?? null,
    }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

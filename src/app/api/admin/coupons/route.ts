import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("coupons")
    .select("id, name, description, type, discount_type, discount_value, minimum_spend, applicable_services, valid_days, active")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, type, discount_type, discount_value, minimum_spend, applicable_services, valid_days } = body;

  if (!name || !type || !discount_type || discount_value === undefined) {
    return NextResponse.json({ error: "name, type, discount_type, discount_value required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("coupons").insert({
    name,
    description: description ?? null,
    type,
    discount_type,
    discount_value: parseFloat(discount_value),
    minimum_spend: parseFloat(minimum_spend) || 0,
    applicable_services: applicable_services ?? null,
    valid_days: valid_days ?? null,
    created_by: "admin",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

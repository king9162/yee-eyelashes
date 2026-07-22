import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? "";
function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2026-07"
  const sb = supabaseAdmin();
  let query = sb.from("expenses").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
  if (month) {
    query = query.gte("date", `${month}-01`).lte("date", `${month}-31`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await supabaseAdmin()
    .from("expenses")
    .insert({ date: body.date, category: body.category, vendor: body.vendor ?? null, description: body.description ?? null, amount: body.amount ?? 0, payment_method: body.payment_method ?? "bank", notes: body.notes ?? null })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: txns } = await db
    .from("points_transactions")
    .select("id, type, amount, balance_after, notes, created_by, created_at")
    .eq("member_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ profile, txns: txns ?? [] });
}

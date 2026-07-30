import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseAdmin();

  const [profileRes, txnsRes, couponsRes] = await Promise.all([
    db.from("profiles").select("*").eq("id", id).single(),
    db.from("points_transactions")
      .select("id, type, amount, balance_after, notes, created_by, created_at")
      .eq("member_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    db.from("member_coupons")
      .select("id, status, issued_at, expires_at, used_at, notes, coupons(id, name, description, discount_type, discount_value)")
      .eq("member_id", id)
      .order("issued_at", { ascending: false })
      .limit(20),
  ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    txns: txnsRes.data ?? [],
    coupons: couponsRes.data ?? [],
  });
}

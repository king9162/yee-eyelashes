import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { coupon_id, notes, expires_at } = await req.json();
  if (!coupon_id) return NextResponse.json({ error: "coupon_id required" }, { status: 400 });

  const db = supabaseAdmin();

  const { error } = await db.from("member_coupons").insert({
    member_id: id,
    coupon_id,
    status: "available",
    notes: notes ?? null,
    expires_at: expires_at ?? null,
    issued_by: "admin",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

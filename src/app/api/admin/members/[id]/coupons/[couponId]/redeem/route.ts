import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; couponId: string }> }
) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, couponId } = await params;
  const body = await req.json().catch(() => ({}));
  const usedBy = body.used_by ?? "admin";

  const db = supabaseAdmin();

  const { data: mc, error: fetchErr } = await db
    .from("member_coupons")
    .select("id, status, member_id")
    .eq("id", couponId)
    .eq("member_id", id)
    .single();

  if (fetchErr || !mc) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  if (mc.status !== "available" && mc.status !== "reserved") {
    return NextResponse.json({ error: `Cannot redeem — status is ${mc.status}` }, { status: 400 });
  }

  const { error } = await db.from("member_coupons").update({
    status: "used",
    used_at: new Date().toISOString(),
    used_by: usedBy,
  }).eq("id", couponId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { amount, type, notes, created_by } = await req.json();

  if (!amount || amount === 0) return NextResponse.json({ error: "Amount required" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "Type required" }, { status: 400 });

  const db = supabaseAdmin();

  // Get current balance
  const { data: profile, error: profErr } = await db
    .from("profiles")
    .select("points_balance")
    .eq("id", id)
    .single();

  if (profErr || !profile) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const newBalance = profile.points_balance + amount;
  if (newBalance < 0) return NextResponse.json({ error: "Insufficient points" }, { status: 400 });

  // Insert transaction
  const { error: txnErr } = await db.from("points_transactions").insert({
    member_id: id,
    type,
    amount,
    balance_after: newBalance,
    notes: notes ?? null,
    created_by: created_by ?? "admin",
  });
  if (txnErr) return NextResponse.json({ error: txnErr.message }, { status: 500 });

  // Update cached balance
  const { error: updateErr } = await db
    .from("profiles")
    .update({ points_balance: newBalance })
    .eq("id", id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, new_balance: newBalance });
}

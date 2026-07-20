import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.client_name  !== undefined) update.client_name   = String(body.client_name).trim();
  if (body.service_label !== undefined) update.service_label = String(body.service_label).trim();
  if (body.amount        !== undefined) update.amount         = parseFloat(body.amount) || 0;
  if (body.tip           !== undefined) update.tip            = parseFloat(body.tip)    || 0;
  if (body.payment_method !== undefined) update.payment_method = body.payment_method;
  if (body.notes         !== undefined) update.notes          = body.notes ?? null;
  if (body.date          !== undefined) update.date           = body.date;

  const db = supabaseAdmin();
  const { data, error } = await db.from("revenue_entries").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = supabaseAdmin();
  const { error } = await db.from("revenue_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

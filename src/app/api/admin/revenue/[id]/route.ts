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
  if (body.client_name   !== undefined) update.client_name    = String(body.client_name).trim();
  if (body.service_label !== undefined) update.service_label  = String(body.service_label).trim();
  if (body.amount        !== undefined) update.amount          = parseFloat(body.amount) || 0;
  if (body.tip           !== undefined) update.tip             = parseFloat(body.tip)    || 0;
  if (body.payment_method !== undefined) update.payment_method = body.payment_method;
  if (body.notes         !== undefined) update.notes           = body.notes ?? null;
  if (body.recorded_by   !== undefined) update.recorded_by     = body.recorded_by ?? null;
  if (body.date          !== undefined) update.date            = body.date;

  const db = supabaseAdmin();
  const { data: before } = await db.from("revenue_entries").select("client_name,amount,tip,payment_method,service_label").eq("id", id).single();
  const { data, error } = await db.from("revenue_entries").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("revenue_audit_log").insert({
    entry_id: id,
    action: "edit",
    changed_by: body.changed_by ?? null,
    details: { before, after: { client_name: update.client_name, amount: update.amount, tip: update.tip, payment_method: update.payment_method, service_label: update.service_label } },
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = supabaseAdmin();
  const { data: entry } = await db.from("revenue_entries").select("client_name,amount,payment_method,date").eq("id", id).single();
  const { error } = await db.from("revenue_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await db.from("revenue_audit_log").insert({
    entry_id: id,
    action: "delete",
    changed_by: body.changed_by ?? null,
    details: entry ?? null,
  });
  return NextResponse.json({ ok: true });
}

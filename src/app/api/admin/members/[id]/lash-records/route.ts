import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization")?.replace("Bearer ", "") === process.env.ADMIN_SECRET_KEY;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("lash_records")
    .select("id, service_date, service_type, material, style, length, curl, lash_count, technician_notes, client_requests, photo_url, created_at")
    .eq("member_id", id)
    .order("service_date", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const { service_date, service_type, material, style, length, curl, lash_count, technician_notes, client_requests } = body;
  if (!service_date) return NextResponse.json({ error: "service_date required" }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db.from("lash_records").insert({
    member_id: id,
    service_date,
    service_type:      service_type ?? null,
    material:          material ?? null,
    style:             style ?? null,
    length:            length ?? null,
    curl:              curl ?? null,
    lash_count:        lash_count ? parseInt(lash_count) : null,
    technician_notes:  technician_notes ?? null,
    client_requests:   client_requests ?? null,
    created_by:        "admin",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

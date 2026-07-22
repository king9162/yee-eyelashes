import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? "";
function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${ADMIN_SECRET_KEY}`;
}

// POST { keepId, mergeIds: string[] }
// Updates all mergeIds rows to use keep's phone/email so they group together.
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { keepId, mergeIds }: { keepId: string; mergeIds: string[] } = await req.json();

  const sb = supabaseAdmin();

  const { data: keepClient, error: keepErr } = await sb.from("clients").select("*").eq("id", keepId).single();
  if (keepErr || !keepClient) return NextResponse.json({ error: "Keep client not found" }, { status: 404 });

  // Build the update payload: prioritize phone, fall back to email
  const updates: Record<string, string | null> = {};
  if (keepClient.phone) {
    updates.phone = keepClient.phone;
  } else if (keepClient.email) {
    updates.email = keepClient.email;
  }
  // Also sync name from keep client
  if (keepClient.first_name) updates.first_name = keepClient.first_name;
  if (keepClient.last_name)  updates.last_name  = keepClient.last_name;

  for (const id of mergeIds) {
    if (id === keepId) continue;
    await sb.from("clients").update(updates).eq("id", id);
  }

  return NextResponse.json({ merged: mergeIds.length });
}

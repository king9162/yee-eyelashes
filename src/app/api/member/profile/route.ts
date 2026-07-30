import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const body = await req.json();
  const { first_name, last_name, phone, birthday } = body;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const updates: Record<string, unknown> = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (birthday !== undefined) {
    updates.birthday = birthday;
    updates.birthday_set_at = new Date().toISOString();
  }

  const { error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If phone was updated, re-link bookings in the background
  if (updates.phone) {
    const origin = req.headers.get("origin") ?? req.headers.get("x-forwarded-host") ?? "";
    const base = origin.startsWith("http") ? origin : `https://${origin}`;
    fetch(`${base}/api/member/link-bookings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

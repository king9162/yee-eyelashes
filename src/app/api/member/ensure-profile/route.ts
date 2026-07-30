import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the user token and get user info
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  // Use service role to upsert profile
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) return NextResponse.json({ created: false });

  // Extract name from Google metadata
  const meta = user.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? "";
  const parts = fullName.trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  const { error: insertError } = await admin.from("profiles").insert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    email: user.email ?? "",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ created: true });
}

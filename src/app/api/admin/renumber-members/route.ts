import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  // Fetch all active members ordered by join date
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, member_id")
    .is("deleted_at", null)
    .order("joined_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profiles || profiles.length === 0) return NextResponse.json({ updated: 0 });

  // Pass 1: clear ALL profiles (including soft-deleted) to temp IDs
  // so no stale YEE-XXXXX from deleted accounts blocks pass 2
  const { data: allProfiles } = await db.from("profiles").select("id");
  for (const p of (allProfiles ?? [])) {
    await db.from("profiles").update({ member_id: `_TEMP_${p.id}` }).eq("id", p.id);
  }

  // Pass 2: set final sequential IDs
  let changed = 0;
  for (let i = 0; i < profiles.length; i++) {
    const newId = `YEE-${String(i + 1).padStart(5, "0")}`;
    await db.from("profiles").update({ member_id: newId }).eq("id", profiles[i].id);
    if (profiles[i].member_id !== newId) changed++;
  }

  return NextResponse.json({ updated: changed, total: profiles.length });
}

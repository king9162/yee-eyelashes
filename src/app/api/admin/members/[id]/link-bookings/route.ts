import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { linkMemberBookings } from "@/lib/linkMemberBookings";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: profile } = await db
    .from("profiles")
    .select("phone, email")
    .eq("id", id)
    .single();

  if (!profile) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const linked = await linkMemberBookings(db, id, profile.phone ?? null, profile.email ?? null);

  return NextResponse.json({ linked });
}

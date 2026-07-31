import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? "";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${ADMIN_SECRET_KEY}`;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db.from("clients").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync notes → profiles.admin_notes for any matching member
  if ("notes" in body && data?.phone) {
    const phone10 = (data.phone as string).replace(/\D/g, "").slice(-10);
    if (phone10) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id")
        .ilike("phone", `%${phone10}`)
        .limit(5);
      if (profiles && profiles.length > 0) {
        const newNotes = (body.notes as string | null | undefined) ?? null;
        await db.from("profiles")
          .update({ admin_notes: newNotes || null })
          .in("id", profiles.map((p: { id: string }) => p.id));
      }
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin().from("clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? "";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${ADMIN_SECRET_KEY}`;
}

type ClientRow = { visit_date?: string | null; notes?: string | null };

function buildAggregatedNotes(rows: ClientRow[]): string | null {
  const withNotes = rows
    .filter(r => r.notes?.trim())
    .sort((a, b) => (b.visit_date ?? "").localeCompare(a.visit_date ?? ""));
  if (withNotes.length === 0) return null;
  return withNotes.map(r => {
    if (!r.visit_date) return r.notes!.trim();
    const [, m, d] = r.visit_date.split("-");
    return `${m}/${d}: ${r.notes!.trim()}`;
  }).join("\n");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db.from("clients").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When notes change, re-aggregate all visit notes for this person → profiles.admin_notes
  if ("notes" in body && data?.phone) {
    const phone10 = (data.phone as string).replace(/\D/g, "").slice(-10);
    if (phone10) {
      // Get all client rows for the same phone (all visits)
      const { data: allRows } = await db
        .from("clients")
        .select("visit_date, notes")
        .or(`phone.ilike.%${phone10},email.eq.${data.email || ""}`);

      const aggregated = buildAggregatedNotes(allRows ?? []);

      const { data: profiles } = await db
        .from("profiles")
        .select("id")
        .ilike("phone", `%${phone10}`)
        .limit(5);

      if (profiles && profiles.length > 0) {
        await db.from("profiles")
          .update({ admin_notes: aggregated ?? null })
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

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.ADMIN_SECRET_KEY}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url    = new URL(req.url);
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const type   = url.searchParams.get("type") ?? "";
  const search = url.searchParams.get("search") ?? "";

  const db = supabaseAdmin();

  let query = db
    .from("points_transactions")
    .select(`
      id, type, amount, balance_after, notes, created_at, created_by,
      member:profiles!points_transactions_member_id_fkey(id, first_name, last_name, vip_tier)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq("type", type);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data ?? [];

  // Client-side filter by member name (no full-text search on joined table in Supabase)
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(r => {
      const m = r.member as { first_name?: string; last_name?: string } | null;
      const name = `${m?.first_name ?? ""} ${m?.last_name ?? ""}`.toLowerCase();
      return name.includes(q) || (r.notes as string ?? "").toLowerCase().includes(q);
    });
  }

  return NextResponse.json({ rows, total: count ?? 0 });
}

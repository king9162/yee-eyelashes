import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { linkMemberBookings } from "@/lib/linkMemberBookings";

function auth(req: NextRequest) {
  return req.headers.get("authorization")?.replace("Bearer ", "") === process.env.ADMIN_SECRET_KEY;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { first_name, last_name, email, phone, birthday, member_id, admin_notes } = await req.json();

  const db = supabaseAdmin();
  const updates: Record<string, unknown> = {};

  if (first_name !== undefined) updates.first_name = (first_name ?? "").trim();
  if (last_name  !== undefined) updates.last_name  = (last_name  ?? "").trim();
  if (email      !== undefined) updates.email      = (email      ?? "").trim();
  if (birthday     !== undefined) updates.birthday     = birthday || null;
  if (admin_notes  !== undefined) updates.admin_notes  = (admin_notes ?? "").trim() || null;
  if (member_id !== undefined) {
    const newMid = (member_id ?? "").trim().toUpperCase();
    // Clear old value first to avoid unique constraint conflict, then set new one
    await db.from("profiles").update({ member_id: `_TEMP_${id}` }).eq("id", id);
    updates.member_id = newMid;
  }

  if (phone !== undefined) {
    const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
    const phoneE164 = digits.length === 10 ? `+1${digits}` : (phone ?? "").trim();
    updates.phone = phoneE164;
    // If login uses synthetic email (p{digits}@yee.member), update auth email too
    if (digits.length === 10) {
      const { data: { user } } = await db.auth.admin.getUserById(id);
      if (/^p\d{10}@yee\.member$/.test(user?.email ?? "")) {
        await db.auth.admin.updateUserById(id, { email: `p${digits}@yee.member` });
      }
    }
  }

  const { error } = await db.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If phone or email changed, auto-link any newly matching bookings
  if (phone !== undefined || email !== undefined) {
    const { data: updated } = await db.from("profiles").select("phone, email").eq("id", id).single();
    if (updated) {
      await linkMemberBookings(db, id, updated.phone ?? null, updated.email ?? null);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = supabaseAdmin();

  // Soft-delete the profile
  const { error: profileError } = await db
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  // Delete the auth user so they can't log back in
  const { error: authError } = await db.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Auth delete error (profile already soft-deleted):", authError.message);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = supabaseAdmin();

  const [profileRes, txnsRes, couponsRes, bookingsRes] = await Promise.all([
    db.from("profiles").select("*").eq("id", id).single(),
    db.from("points_transactions")
      .select("id, type, amount, balance_after, notes, created_by, created_at")
      .eq("member_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    db.from("member_coupons")
      .select("id, status, issued_at, expires_at, used_at, notes, coupons(id, name, description, discount_type, discount_value)")
      .eq("member_id", id)
      .order("issued_at", { ascending: false })
      .limit(20),
    db.from("bookings")
      .select("id, date, time, service, service_label, status, price")
      .eq("member_id", id)
      .order("date", { ascending: false })
      .limit(50),
  ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    txns: txnsRes.data ?? [],
    coupons: couponsRes.data ?? [],
    bookings: bookingsRes.data ?? [],
  });
}

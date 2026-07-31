import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "lash-photos";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, recordId } = await params;
  const db = supabaseAdmin();

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${id}/${recordId}.${ext}`;
  const bytes = await file.arrayBuffer();

  // Ensure bucket exists
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.find(b => b.name === BUCKET)) {
    await db.storage.createBucket(BUCKET, { public: true });
  }

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);

  const { error: updateError } = await db
    .from("lash_records")
    .update({ photo_url: publicUrl })
    .eq("id", recordId)
    .eq("member_id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ photo_url: publicUrl });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, recordId } = await params;
  const db = supabaseAdmin();

  // Remove photo_url from record
  await db.from("lash_records").update({ photo_url: null }).eq("id", recordId).eq("member_id", id);

  return NextResponse.json({ ok: true });
}

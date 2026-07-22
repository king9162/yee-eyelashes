import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY ?? "";
const MANAGER_PIN = process.env.MANAGER_PIN ?? "0219";

function auth(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${ADMIN_SECRET_KEY}`;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { pin } = await req.json();
  if (pin !== MANAGER_PIN) return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  return NextResponse.json({ ok: true });
}

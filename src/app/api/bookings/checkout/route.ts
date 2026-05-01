import { NextRequest, NextResponse } from "next/server";

// Deposit/checkout flow is not currently in use.
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Not in use" }, { status: 501 });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace("Bearer ", "");
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();

  const defaults = [
    {
      name: "Birthday Reward — 20% Off",
      description: "Happy Birthday! Enjoy 20% off any service during your birthday month.",
      type: "birthday",
      discount_type: "percentage",
      discount_value: 20,
      minimum_spend: 0,
      valid_days: null,
      max_uses_per_member: 1,
      active: true,
    },
    {
      name: "Welcome Gift — $10 Off",
      description: "Welcome to Yee Eyelashes! Enjoy $10 off your first visit.",
      type: "fixed_amount",
      discount_type: "fixed",
      discount_value: 10,
      minimum_spend: 0,
      valid_days: 90,
      max_uses_per_member: 1,
      active: true,
    },
    {
      name: "VIP Reward — 15% Off",
      description: "A special reward for our valued VIP members.",
      type: "percentage",
      discount_type: "percentage",
      discount_value: 15,
      minimum_spend: 0,
      valid_days: 60,
      max_uses_per_member: 1,
      active: true,
    },
    {
      name: "Refill Special — $5 Off",
      description: "$5 off your next refill appointment.",
      type: "fixed_amount",
      discount_type: "fixed",
      discount_value: 5,
      minimum_spend: 0,
      valid_days: 30,
      max_uses_per_member: 1,
      active: true,
    },
  ];

  // Ensure birthday coupon is always 20% — update any existing row that differs
  await db.from("coupons")
    .update({
      name: "Birthday Reward — 20% Off",
      description: "Happy Birthday! Enjoy 20% off any service during your birthday month.",
      discount_value: 20,
    })
    .eq("type", "birthday");

  const results = [];
  for (const coupon of defaults) {
    // Skip types that already exist (birthday is handled by the update above)
    const { data: existing } = await db
      .from("coupons")
      .select("id")
      .eq("name", coupon.name)
      .limit(1);

    // For birthday, also check old name
    const { data: existingOldName } = coupon.type === "birthday"
      ? await db.from("coupons").select("id").eq("type", "birthday").limit(1)
      : { data: null };

    if ((existing && existing.length > 0) || (existingOldName && existingOldName.length > 0)) {
      results.push({ name: coupon.name, status: "updated/skipped" });
      continue;
    }

    const { error } = await db.from("coupons").insert({ ...coupon, created_by: "system" });
    results.push({ name: coupon.name, status: error ? `error: ${error.message}` : "created" });
  }

  return NextResponse.json({ results });
}

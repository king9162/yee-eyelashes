"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type MemberCoupon = {
  id: string;
  status: "available" | "reserved" | "used" | "expired" | "cancelled";
  issued_at: string;
  expires_at: string | null;
  used_at: string | null;
  notes: string | null;
  coupons: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    discount_type: string;
    discount_value: number;
    minimum_spend: number;
    applicable_services: string[] | null;
  } | null;
};

function discountLabel(c: MemberCoupon["coupons"]) {
  if (!c) return "";
  if (c.discount_type === "fixed") return `$${c.discount_value.toFixed(0)} off`;
  return `${c.discount_value}% off`;
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "#C9A84C" },
  reserved:  { label: "Reserved",  color: "#6B7280" },
  used:      { label: "Used",      color: "#9CA3AF" },
  expired:   { label: "Expired",   color: "#9CA3AF" },
  cancelled: { label: "Cancelled", color: "#EF4444" },
};

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<MemberCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "used">("active");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }
      const res = await fetch("/api/member/coupons", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [router]);

  const active = coupons.filter(c => ["available", "reserved"].includes(c.status));
  const history = coupons.filter(c => ["used", "expired", "cancelled"].includes(c.status));
  const shown = tab === "active" ? active : history;

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <header className="bg-[#0F0F0F] px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/member/dashboard")}
          className="text-neutral-400 hover:text-white transition-colors text-[20px] leading-none">←</button>
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
          <p className="text-[10px] text-neutral-500">My Coupons</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="flex bg-white rounded-xl border border-neutral-100 p-1 mb-5">
          {(["active", "used"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                tab === t ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-600"
              }`}>
              {t === "active" ? `Active (${active.length})` : `History (${history.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3" style={{ color: "#C9A84C" }}>✦</p>
            <p className="text-[14px] font-semibold text-[#1C1C1C] mb-1">
              {tab === "active" ? "No coupons yet" : "No coupon history"}
            </p>
            <p className="text-[12px] text-neutral-400">
              {tab === "active"
                ? "Coupons issued by Yee Eyelashes will appear here"
                : "Your used and expired coupons will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map(mc => {
              const st = STATUS_STYLE[mc.status];
              const c = mc.coupons;
              const isActive = mc.status === "available";
              // Generate description from data so it's always accurate
              const displayDesc = c?.type === "birthday"
                ? `Happy Birthday! Enjoy ${c.discount_value}% off any service during your birthday month.`
                : c?.description ?? null;

              return (
                <div key={mc.id}
                  className={`rounded-2xl border overflow-hidden ${isActive ? "border-[#C9A84C]/40" : "border-neutral-100"}`}>
                  {/* Top band — light cream theme */}
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ background: isActive ? "#F8F5EF" : "#F9F9F9" }}>
                    <div>
                      <p className="text-[22px] font-light text-[#C9A84C]"
                        style={{ fontFamily: "var(--font-cormorant)" }}>
                        {c ? discountLabel(c) : "Coupon"}
                      </p>
                      <p className="text-[11px] mt-0.5 text-[#1C1C1C] font-medium">
                        {c?.name ?? "Coupon"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase" style={{ color: st.color }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="bg-white px-4 py-3 space-y-1.5 border-t border-[#EDE9DF]">
                    {displayDesc && (
                      <p className="text-[12px] text-neutral-600">{displayDesc}</p>
                    )}
                    {(c?.minimum_spend ?? 0) > 0 && c && (
                      <p className="text-[11px] text-neutral-400">Min. spend: ${c.minimum_spend}</p>
                    )}
                    {c?.applicable_services && c.applicable_services.length > 0 && (
                      <p className="text-[11px] text-neutral-400">
                        Valid for: {c.applicable_services.join(", ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[10px] text-neutral-300">
                        Issued {new Date(mc.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {mc.expires_at && (
                        <p className="text-[10px] text-neutral-400">
                          Expires {new Date(mc.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <p className="text-[11px] text-[#C9A84C] font-semibold pt-1">
                        Show this to staff at checkout ✦
                      </p>
                    )}
                    {mc.used_at && (
                      <p className="text-[11px] text-neutral-400">
                        Used {new Date(mc.used_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

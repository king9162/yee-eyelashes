"use client";
import { useState, useRef, useEffect } from "react";

type MemberResult = {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  vip_tier: string;
  points_balance: number;
  total_spend_all_time: number;
  total_visits_all_time: number;
};

type ActiveCoupon = {
  id: string;
  status: string;
  expires_at: string | null;
  coupons: {
    name: string;
    discount_type: string;
    discount_value: number;
    description: string | null;
  } | null;
};

const TIER_COLORS: Record<string, string> = {
  member: "#888", silver: "#C0C0C0", gold: "#C9A84C", diamond: "#A8DAFF",
};

function discountLabel(c: ActiveCoupon["coupons"]) {
  if (!c) return "";
  return c.discount_type === "fixed" ? `$${c.discount_value} off` : `${c.discount_value}% off`;
}

export default function CheckoutView({ adminKey }: { adminKey: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [member, setMember] = useState<MemberResult | null>(null);
  const [coupons, setCoupons] = useState<ActiveCoupon[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Redeem points
  const [redeemDollar, setRedeemDollar] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  // Award points
  const [awardPts, setAwardPts] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardMsg, setAwardMsg] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const h = { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" };

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/admin/members?q=${encodeURIComponent(query)}`, { headers: h });
      const data = await res.json();
      setResults(Array.isArray(data) ? data.slice(0, 6) : []);
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  async function selectMember(m: MemberResult) {
    setMember(m);
    setResults([]);
    setQuery(`${m.first_name} ${m.last_name}`);
    setRedeemMsg(""); setAwardMsg("");
    setLoadingDetail(true);
    const res = await fetch(`/api/admin/members/${m.id}`, { headers: h });
    const data = await res.json();
    setCoupons((data.coupons ?? []).filter((c: ActiveCoupon) => c.status === "available"));
    setMember(data.profile ?? m);
    setLoadingDetail(false);
  }

  function reset() {
    setMember(null); setCoupons([]);
    setQuery(""); setResults([]);
    setRedeemDollar(""); setAwardPts("");
    setRedeemMsg(""); setAwardMsg("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function redeemCoupon(couponId: string) {
    if (!member) return;
    await fetch(`/api/admin/members/${member.id}/coupons/${couponId}/redeem`, {
      method: "POST", headers: h, body: JSON.stringify({ used_by: "admin" }),
    });
    const res = await fetch(`/api/admin/members/${member.id}`, { headers: h });
    const data = await res.json();
    setCoupons((data.coupons ?? []).filter((c: ActiveCoupon) => c.status === "available"));
    setMember(data.profile ?? member);
  }

  async function redeemPoints() {
    if (!member) return;
    const dollars = parseFloat(redeemDollar);
    if (!dollars || dollars <= 0) return;
    const pts = Math.ceil(dollars * 100);
    if (pts > member.points_balance) { setRedeemMsg("Insufficient points"); return; }

    setRedeeming(true); setRedeemMsg("");
    const res = await fetch(`/api/admin/members/${member.id}/points`, {
      method: "POST", headers: h,
      body: JSON.stringify({ amount: -pts, type: "redemption", notes: `$${dollars.toFixed(2)} discount`, created_by: "admin" }),
    });
    const d = await res.json();
    setRedeeming(false);
    if (!res.ok) { setRedeemMsg(`Error: ${d.error}`); return; }
    setRedeemMsg(`Redeemed ${pts} pts — $${dollars.toFixed(2)} discount applied`);
    setRedeemDollar("");
    setMember(prev => prev ? { ...prev, points_balance: d.new_balance } : prev);
  }

  async function awardPoints() {
    if (!member || !awardPts) return;
    const pts = parseInt(awardPts);
    if (!pts || pts <= 0) return;

    setAwarding(true); setAwardMsg("");
    const res = await fetch(`/api/admin/members/${member.id}/points`, {
      method: "POST", headers: h,
      body: JSON.stringify({ amount: pts, type: "manual_adjustment", notes: "Staff award at checkout", created_by: "admin" }),
    });
    const d = await res.json();
    setAwarding(false);
    if (!res.ok) { setAwardMsg(`Error: ${d.error}`); return; }
    setAwardMsg(`+${pts} pts added`);
    setAwardPts("");
    setMember(prev => prev ? { ...prev, points_balance: d.new_balance } : prev);
  }

  const ptsValue = member ? (member.points_balance / 100).toFixed(2) : "0";

  return (
    <div className="flex-1 overflow-auto bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Search */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] mb-2">Member Checkout</p>
          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); if (member) setMember(null); }}
              placeholder="Search member by name, phone, or email…"
              className="w-full border-2 border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-2xl px-4 py-3.5 text-[14px] bg-white focus:outline-none transition-colors"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {results.length > 0 && !member && (
            <div className="mt-1 bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
              {results.map(r => (
                <button key={r.id} onClick={() => selectMember(r)}
                  className="w-full text-left px-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1C1C1C]">{r.first_name} {r.last_name}</p>
                    <p className="text-[11px] text-neutral-400">{r.phone ?? r.email ?? r.member_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-[#C9A84C]">{r.points_balance} pts</p>
                    <p className="text-[10px] font-bold uppercase" style={{ color: TIER_COLORS[r.vip_tier] }}>{r.vip_tier}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Member card */}
        {member && (
          <>
            {loadingDetail ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Points card */}
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #1C1C1C 0%, #2D2008 100%)" }}>
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5"
                    style={{ background: "#C9A84C", transform: "translate(30%,-30%)" }} />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-semibold text-[17px]">{member.first_name} {member.last_name}</p>
                      <p className="text-neutral-400 text-[11px] mt-0.5">{member.member_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase" style={{ color: TIER_COLORS[member.vip_tier] }}>
                        {member.vip_tier}
                      </span>
                      <button onClick={reset}
                        className="text-neutral-500 hover:text-white text-[18px] transition-colors ml-2">×</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-[10px] mb-1">Points Balance</p>
                    <p className="text-[#C9A84C] font-light leading-none" style={{ fontSize: 36, fontFamily: "var(--font-cormorant)" }}>
                      {member.points_balance.toLocaleString()}
                      <span className="text-[18px] text-neutral-400 ml-1">pts</span>
                    </p>
                    <p className="text-neutral-500 text-[11px] mt-1">≈ ${ptsValue} discount value</p>
                  </div>
                </div>

                {/* Active coupons */}
                {coupons.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#C9A84C]/20 overflow-hidden">
                    <p className="px-4 pt-3 pb-2 text-[11px] uppercase tracking-[0.15em] text-[#C9A84C]">Active Coupons</p>
                    {coupons.map(mc => (
                      <div key={mc.id} className="flex items-center justify-between px-4 py-3 border-t border-neutral-50">
                        <div>
                          <p className="text-[13px] font-semibold text-[#1C1C1C]">{mc.coupons?.name ?? "Coupon"}</p>
                          <p className="text-[11px] text-[#C9A84C] font-semibold mt-0.5">
                            {discountLabel(mc.coupons)}
                            {mc.expires_at && (
                              <span className="text-neutral-400 font-normal ml-2">
                                Exp {new Date(mc.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </p>
                        </div>
                        <button onClick={() => redeemCoupon(mc.id)}
                          className="px-4 py-2 text-[11px] font-bold bg-[#C9A84C] text-[#1C1C1C] rounded-xl hover:bg-[#b8953d] transition-colors">
                          Redeem
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Redeem points */}
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-3">
                  <p className="text-[12px] font-bold text-[#1C1C1C]">Redeem Points as Discount</p>
                  <p className="text-[11px] text-neutral-400">100 pts = $1.00 off · Balance: {member.points_balance} pts (≈ ${ptsValue})</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">$</span>
                      <input
                        value={redeemDollar}
                        onChange={e => setRedeemDollar(e.target.value)}
                        type="number" min="0" step="0.01"
                        placeholder="Amount to discount"
                        className="w-full border border-neutral-200 rounded-xl pl-7 pr-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <button onClick={redeemPoints} disabled={redeeming || !redeemDollar}
                      className="px-5 py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                      {redeeming ? "…" : "Apply"}
                    </button>
                  </div>
                  {redeemMsg && (
                    <p className={`text-[12px] font-semibold ${redeemMsg.startsWith("Error") || redeemMsg === "Insufficient points" ? "text-red-500" : "text-green-600"}`}>
                      {redeemMsg}
                    </p>
                  )}
                </div>

                {/* Award points */}
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-3">
                  <p className="text-[12px] font-bold text-[#1C1C1C]">Award Bonus Points</p>
                  <div className="flex gap-2">
                    <input
                      value={awardPts}
                      onChange={e => setAwardPts(e.target.value)}
                      type="number" min="1"
                      placeholder="Points to award"
                      className="flex-1 border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                    />
                    <button onClick={awardPoints} disabled={awarding || !awardPts}
                      className="px-5 py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                      {awarding ? "…" : "Award"}
                    </button>
                  </div>
                  {awardMsg && <p className="text-[12px] font-semibold text-green-600">{awardMsg}</p>}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Visits", value: member.total_visits_all_time },
                    { label: "Total Spent", value: `$${member.total_spend_all_time.toFixed(0)}` },
                    { label: "Active Coupons", value: coupons.length },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-neutral-100 p-3 text-center">
                      <p className="text-[18px] font-bold text-[#1C1C1C]">{s.value}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

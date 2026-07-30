"use client";
import { useState, useEffect, useCallback } from "react";

type Member = {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  vip_tier: string;
  points_balance: number;
  total_spend_all_time: number;
  total_visits_all_time: number;
  last_visit_date: string | null;
  joined_at: string;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  notes: string | null;
  created_by: string;
  created_at: string;
};

const TIER_COLORS: Record<string, string> = {
  member: "#888", silver: "#C0C0C0", gold: "#C9A84C", diamond: "#A8DAFF",
};

const TXN_LABELS: Record<string, string> = {
  purchase_earned: "Points Earned", referral_reward: "Referral",
  birthday_bonus: "Birthday Reward", promotion_bonus: "Promotion",
  manual_adjustment: "Manual Adjust", redemption: "Redeemed",
  refund_adjustment: "Refund", expired: "Expired",
};

export default function MembersView({ adminKey }: { adminKey: string }) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [detail, setDetail] = useState<{ profile: Member; txns: Transaction[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Award points state
  const [awardAmount, setAwardAmount] = useState("");
  const [awardType, setAwardType] = useState("purchase_earned");
  const [awardNotes, setAwardNotes] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardMsg, setAwardMsg] = useState("");

  const search = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [adminKey]);

  useEffect(() => { search(""); }, [search]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function loadDetail(m: Member) {
    setSelected(m);
    setDetail(null);
    setDetailLoading(true);
    setAwardMsg("");
    const res = await fetch(`/api/admin/members/${m.id}`, {
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    const data = await res.json();
    setDetail(data);
    setDetailLoading(false);
  }

  async function awardPoints() {
    if (!selected || !awardAmount) return;
    const amt = parseInt(awardAmount);
    if (isNaN(amt) || amt === 0) return;
    setAwarding(true); setAwardMsg("");

    const res = await fetch(`/api/admin/members/${selected.id}/points`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, type: awardType, notes: awardNotes || null, created_by: "admin" }),
    });
    const d = await res.json();
    setAwarding(false);

    if (!res.ok) { setAwardMsg(`Error: ${d.error}`); return; }
    setAwardMsg(`Done! New balance: ${d.new_balance} pts`);
    setAwardAmount(""); setAwardNotes("");
    await loadDetail(selected);
    search(query);
  }

  return (
    <div className="flex h-[calc(100vh-64px)]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Left: list */}
      <div className="w-80 border-r border-neutral-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-[#1C1C1C] mb-3">Members</h2>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, phone, email…"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-[12px] text-neutral-400 text-center py-8">Loading…</p>
          ) : members.length === 0 ? (
            <p className="text-[12px] text-neutral-400 text-center py-8">No members found</p>
          ) : (
            members.map(m => (
              <button
                key={m.id}
                onClick={() => loadDetail(m)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${selected?.id === m.id ? "bg-neutral-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[#1C1C1C]">
                    {m.first_name} {m.last_name}
                  </p>
                  <span className="text-[10px] font-bold uppercase" style={{ color: TIER_COLORS[m.vip_tier] }}>
                    {m.vip_tier}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">{m.member_id}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#C9A84C] font-semibold">{m.points_balance} pts</span>
                  <span className="text-[11px] text-neutral-400">${m.total_spend_all_time.toFixed(0)} spent</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-400">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Right: detail */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAF8]">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-neutral-400">Select a member to view details</p>
          </div>
        ) : detailLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : detail ? (
          <div className="p-6 space-y-5 max-w-xl">
            {/* Profile header */}
            <div className="bg-white rounded-xl border border-neutral-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[18px] font-bold text-[#1C1C1C]">
                    {detail.profile.first_name} {detail.profile.last_name}
                  </p>
                  <p className="text-[12px] text-neutral-400">{detail.profile.member_id}</p>
                </div>
                <span
                  className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full"
                  style={{
                    color: TIER_COLORS[detail.profile.vip_tier],
                    background: `${TIER_COLORS[detail.profile.vip_tier]}22`,
                    border: `1px solid ${TIER_COLORS[detail.profile.vip_tier]}44`,
                  }}
                >
                  {detail.profile.vip_tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                {[
                  { label: "Email", value: detail.profile.email ?? "—" },
                  { label: "Phone", value: detail.profile.phone ?? "—" },
                  { label: "Birthday", value: detail.profile.birthday ?? "—" },
                  { label: "Joined", value: new Date(detail.profile.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-0.5">{f.label}</p>
                    <p className="text-[#1C1C1C] font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Points", value: `${detail.profile.points_balance}` },
                { label: "Total Spent", value: `$${detail.profile.total_spend_all_time.toFixed(0)}` },
                { label: "Visits", value: `${detail.profile.total_visits_all_time}` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-neutral-100 p-3 text-center">
                  <p className="text-[18px] font-bold text-[#1C1C1C]">{s.value}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Award points */}
            <div className="bg-white rounded-xl border border-neutral-100 p-5">
              <p className="text-[13px] font-bold text-[#1C1C1C] mb-4">Award / Adjust Points</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Amount</label>
                    <input
                      value={awardAmount}
                      onChange={e => setAwardAmount(e.target.value)}
                      placeholder="e.g. 150 or -50"
                      type="number"
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Type</label>
                    <select
                      value={awardType}
                      onChange={e => setAwardType(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white"
                    >
                      <option value="purchase_earned">Purchase Earned</option>
                      <option value="birthday_bonus">Birthday Bonus</option>
                      <option value="referral_reward">Referral Reward</option>
                      <option value="promotion_bonus">Promotion</option>
                      <option value="manual_adjustment">Manual Adjustment</option>
                      <option value="redemption">Redemption</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Notes (optional)</label>
                  <input
                    value={awardNotes}
                    onChange={e => setAwardNotes(e.target.value)}
                    placeholder="e.g. Classic Full Set $120"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                {awardMsg && (
                  <p className={`text-[12px] font-semibold ${awardMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                    {awardMsg}
                  </p>
                )}
                <button
                  onClick={awardPoints}
                  disabled={awarding || !awardAmount}
                  className="w-full py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40"
                >
                  {awarding ? "Processing…" : "Confirm"}
                </button>
              </div>
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-[13px] font-bold text-[#1C1C1C]">Points History</p>
              </div>
              {detail.txns.length === 0 ? (
                <p className="text-[12px] text-neutral-400 text-center py-6">No transactions yet</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {detail.txns.map(t => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-[12px] font-medium text-[#1C1C1C]">{TXN_LABELS[t.type] ?? t.type}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {t.notes && ` · ${t.notes}`}
                          {" · "}<span className="text-neutral-300">{t.created_by}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[13px] font-semibold ${t.amount > 0 ? "text-[#C9A84C]" : "text-neutral-500"}`}>
                          {t.amount > 0 ? `+${t.amount}` : t.amount} pts
                        </p>
                        <p className="text-[10px] text-neutral-300">{t.balance_after} rem</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

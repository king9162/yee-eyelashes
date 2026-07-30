"use client";
import { useEffect, useState, useCallback } from "react";

type Member = { id: string; first_name: string | null; last_name: string | null; vip_tier: string };
type Row = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  member: Member | null;
};

const TYPE_LABELS: Record<string, string> = {
  purchase_earned:   "Purchase",
  referral_bonus:    "Referral Bonus",
  referral_reward:   "Referral Reward",
  birthday_bonus:    "Birthday",
  promotion_bonus:   "Promotion",
  manual_adjustment: "Manual",
  redemption:        "Redemption",
  refund_adjustment: "Refund",
  expired:           "Expired",
};

const TYPE_COLORS: Record<string, string> = {
  purchase_earned: "#065F46",
  referral_bonus:  "#1D4ED8",
  referral_reward: "#1D4ED8",
  birthday_bonus:  "#9333EA",
  promotion_bonus: "#C9A84C",
  manual_adjustment: "#6B7280",
  redemption:      "#991B1B",
  refund_adjustment: "#92400E",
  expired:         "#9CA3AF",
};

const TYPE_BG: Record<string, string> = {
  purchase_earned: "#D1FAE5",
  referral_bonus:  "#DBEAFE",
  referral_reward: "#DBEAFE",
  birthday_bonus:  "#F3E8FF",
  promotion_bonus: "#FEF9EC",
  manual_adjustment: "#F3F4F6",
  redemption:      "#FEE2E2",
  refund_adjustment: "#FEF3C7",
  expired:         "#F9FAFB",
};

const PAGE = 100;
const ALL_TYPES = ["", "purchase_earned", "referral_bonus", "birthday_bonus", "promotion_bonus", "manual_adjustment", "redemption", "expired"];

function memberName(m: Member | null) {
  if (!m) return "—";
  return [m.first_name, m.last_name].filter(Boolean).join(" ") || "—";
}

export default function PointsLedgerView({ adminKey }: { adminKey: string }) {
  const [rows,    setRows]    = useState<Row[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset,  setOffset]  = useState(0);
  const [type,    setType]    = useState("");
  const [search,  setSearch]  = useState("");
  const [searchQ, setSearchQ] = useState("");

  const load = useCallback(async (off: number, t: string, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(PAGE), offset: String(off) });
    if (t) params.set("type", t);
    if (q) params.set("search", q);
    const res = await fetch(`/api/admin/points-ledger?${params}`, {
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    const d = await res.json();
    setRows(Array.isArray(d.rows) ? d.rows : []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, [adminKey]);

  useEffect(() => { load(0, type, searchQ); }, [load, type, searchQ]);

  function applySearch() { setOffset(0); setSearchQ(search); }

  const totalEarned  = rows.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const totalSpent   = rows.filter(r => r.amount < 0).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Points Ledger
          </h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">{total.toLocaleString()} total transactions</p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
            <p className="text-[16px] font-bold text-emerald-700">+{totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 uppercase tracking-wide">Earned (page)</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2">
            <p className="text-[16px] font-bold text-red-600">{totalSpent.toLocaleString()}</p>
            <p className="text-[10px] text-red-500 uppercase tracking-wide">Used (page)</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applySearch()}
            placeholder="Search member name or notes…"
            className="flex-1 border border-[#D4CCC0] bg-white rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]"
          />
          <button onClick={applySearch}
            className="px-4 py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            Search
          </button>
        </div>
        <select value={type} onChange={e => { setType(e.target.value); setOffset(0); }}
          className="border border-[#D4CCC0] bg-white rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]">
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{t ? (TYPE_LABELS[t] ?? t) : "All Types"}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-neutral-400">No transactions found</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_90px_70px_80px_100px] gap-3 px-4 py-2">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Member</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Type</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 text-right">Pts</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 text-right">Balance</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Date</p>
          </div>

          <div className="space-y-1.5">
            {rows.map(r => {
              const color  = TYPE_COLORS[r.type] ?? "#777";
              const bg     = TYPE_BG[r.type] ?? "#F9FAFB";
              const label  = TYPE_LABELS[r.type] ?? r.type;
              const date   = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

              return (
                <div key={r.id}
                  className="grid grid-cols-[1fr_90px_70px_80px_100px] gap-3 items-center bg-white rounded-xl border border-neutral-100 px-4 py-3 hover:border-neutral-200 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{memberName(r.member)}</p>
                    {r.notes && (
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{r.notes}</p>
                    )}
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-full"
                      style={{ color, background: bg }}>
                      {label}
                    </span>
                  </div>
                  <p className={`text-[14px] font-bold text-right ${r.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {r.amount > 0 ? `+${r.amount}` : r.amount}
                  </p>
                  <p className="text-[12px] text-neutral-500 text-right">{r.balance_after}</p>
                  <p className="text-[11px] text-neutral-400">{date}</p>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {total > PAGE && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-[12px] text-neutral-400">
                Showing {offset + 1}–{Math.min(offset + PAGE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={offset === 0}
                  onClick={() => { const o = Math.max(0, offset - PAGE); setOffset(o); load(o, type, searchQ); }}
                  className="px-4 py-2 text-[12px] border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-[#C9A84C] transition-colors">
                  ← Prev
                </button>
                <button
                  disabled={offset + PAGE >= total}
                  onClick={() => { const o = offset + PAGE; setOffset(o); load(o, type, searchQ); }}
                  className="px-4 py-2 text-[12px] border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-[#C9A84C] transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Row = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  notes: string | null;
  created_at: string;
};

const TXN_LABELS: Record<string, string> = {
  purchase_earned:   "Points Earned",
  referral_bonus:    "Referral Bonus",
  referral_reward:   "Referral Reward",
  birthday_bonus:    "Birthday Reward",
  promotion_bonus:   "Promotion Bonus",
  manual_adjustment: "Manual Adjustment",
  redemption:        "Points Redeemed",
  refund_adjustment: "Refund Adjustment",
  expired:           "Points Expired",
};

const TYPE_ICON: Record<string, string> = {
  purchase_earned:   "✦",
  referral_bonus:    "🎉",
  referral_reward:   "🎉",
  birthday_bonus:    "🎂",
  promotion_bonus:   "⭐",
  manual_adjustment: "✎",
  redemption:        "↓",
  refund_adjustment: "↩",
  expired:           "⌛",
};

const FILTER_TYPES = [
  { value: "", label: "All" },
  { value: "purchase_earned",   label: "Earned" },
  { value: "referral_bonus",    label: "Referral" },
  { value: "birthday_bonus",    label: "Birthday" },
  { value: "redemption",        label: "Redeemed" },
  { value: "expired",           label: "Expired" },
];

const PAGE = 50;

export default function PointsHistoryPage() {
  const router = useRouter();
  const [token, setToken]   = useState("");
  const [rows,  setRows]    = useState<Row[]>([]);
  const [total, setTotal]   = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset]   = useState(0);
  const [type,   setType]     = useState("");

  const load = useCallback(async (tok: string, off: number, t: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(PAGE), offset: String(off) });
    if (t) params.set("type", t);
    const res = await fetch(`/api/member/points-history?${params}`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const d = await res.json();
    setRows(Array.isArray(d.rows) ? d.rows : []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }
      setToken(session.access_token);

      const { data: prof } = await supabase
        .from("profiles")
        .select("points_balance")
        .eq("id", session.user.id)
        .single();
      setBalance((prof?.points_balance as number) ?? 0);

      await load(session.access_token, 0, "");
    }
    init();
  }, [router, load]);

  function changeType(t: string) {
    setType(t);
    setOffset(0);
    load(token, 0, t);
  }

  function changePage(off: number) {
    setOffset(off);
    load(token, off, type);
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <header className="bg-[#0F0F0F] px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/member/dashboard")}
          className="text-neutral-400 hover:text-white transition-colors text-[20px] leading-none">←</button>
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
          <p className="text-[10px] text-neutral-500">Points History</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Balance banner */}
        <div className="rounded-2xl p-5 mb-5 text-center"
          style={{ background: "linear-gradient(135deg, #1C1C1C 0%, #2D2008 100%)" }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-1">Current Balance</p>
          <p className="text-[44px] font-light text-white leading-none" style={{ fontFamily: "var(--font-cormorant)" }}>
            {balance.toLocaleString()}
            <span className="text-[18px] text-neutral-400 ml-1">pts</span>
          </p>
          <p className="text-[12px] text-neutral-500 mt-1">
            ≈ ${(balance / 100).toFixed(2)} off · Show to staff at checkout
          </p>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          {FILTER_TYPES.map(f => (
            <button key={f.value} onClick={() => changeType(f.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                type === f.value
                  ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
                  : "bg-white text-neutral-500 border-neutral-200 hover:border-[#C9A84C]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-neutral-400 mb-3">{total} transaction{total !== 1 ? "s" : ""}</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3" style={{ color: "#C9A84C" }}>✦</p>
            <p className="text-[14px] font-semibold text-[#1C1C1C] mb-1">No transactions yet</p>
            <p className="text-[12px] text-neutral-400">Points appear here after each visit</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {rows.map(r => {
                const isPositive = r.amount > 0;
                const label = TXN_LABELS[r.type] ?? r.type;
                const icon  = TYPE_ICON[r.type] ?? "·";
                const date  = new Date(r.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                });
                return (
                  <div key={r.id} className="bg-white rounded-xl border border-neutral-100 px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[14px]"
                      style={{ background: isPositive ? "#FEF9EC" : "#F3F4F6" }}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{label}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        {date}{r.notes ? ` · ${r.notes}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[14px] font-bold ${isPositive ? "text-[#C9A84C]" : "text-neutral-500"}`}>
                        {isPositive ? `+${r.amount}` : r.amount} pts
                      </p>
                      <p className="text-[10px] text-neutral-300">{r.balance_after} bal</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {total > PAGE && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-[11px] text-neutral-400">
                  {offset + 1}–{Math.min(offset + PAGE, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button disabled={offset === 0} onClick={() => changePage(Math.max(0, offset - PAGE))}
                    className="px-4 py-2 text-[12px] border border-neutral-200 rounded-xl disabled:opacity-40 bg-white">
                    ← Prev
                  </button>
                  <button disabled={offset + PAGE >= total} onClick={() => changePage(offset + PAGE)}
                    className="px-4 py-2 text-[12px] border border-neutral-200 rounded-xl disabled:opacity-40 bg-white">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

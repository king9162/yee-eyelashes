"use client";
import { useEffect, useState } from "react";

type ReferralProfile = { id: string; first_name: string | null; last_name: string | null; email: string | null };
type Referral = {
  id: string;
  status: "pending" | "completed" | "rewarded" | "cancelled";
  created_at: string;
  referrer_rewarded_at: string | null;
  referrer: ReferralProfile | null;
  referee:  ReferralProfile | null;
};

function fullName(p: ReferralProfile | null) {
  if (!p) return "—";
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "—";
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#92400E", bg: "#FEF3C7" },
  completed: { label: "Completed", color: "#065F46", bg: "#D1FAE5" },
  rewarded:  { label: "Rewarded",  color: "#1D4ED8", bg: "#DBEAFE" },
  cancelled: { label: "Cancelled", color: "#991B1B", bg: "#FEE2E2" },
};

export default function ReferralsView({ adminKey }: { adminKey: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"all" | "pending" | "completed">("all");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    fetch("/api/admin/referrals", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then(r => r.json())
      .then(d => { setReferrals(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [adminKey]);

  const filtered = referrals.filter(r => {
    if (tab === "pending"   && r.status !== "pending")   return false;
    if (tab === "completed" && !["completed","rewarded"].includes(r.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      const rferrerMatch = fullName(r.referrer).toLowerCase().includes(q) || (r.referrer?.email ?? "").toLowerCase().includes(q);
      const refereeMatch = fullName(r.referee).toLowerCase().includes(q)  || (r.referee?.email ?? "").toLowerCase().includes(q);
      return rferrerMatch || refereeMatch;
    }
    return true;
  });

  const pendingCount   = referrals.filter(r => r.status === "pending").length;
  const completedCount = referrals.filter(r => ["completed","rewarded"].includes(r.status)).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Referrals
          </h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">{referrals.length} total</p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            <p className="text-[18px] font-bold text-amber-700">{pendingCount}</p>
            <p className="text-[10px] text-amber-600 uppercase tracking-wide">Pending</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
            <p className="text-[18px] font-bold text-emerald-700">{completedCount}</p>
            <p className="text-[10px] text-emerald-600 uppercase tracking-wide">Completed</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-2.5 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors mb-4"
      />

      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-neutral-100 p-1 mb-5">
        {(["all", "pending", "completed"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all capitalize ${
              tab === t ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-600"
            }`}>
            {t === "all" ? `All (${referrals.length})` : t === "pending" ? `Pending (${pendingCount})` : `Completed (${completedCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[13px] text-neutral-400">No referrals found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_100px_80px] gap-3 px-4 py-2">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Referrer</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Referred</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Date</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Status</p>
          </div>

          {filtered.map(r => {
            const st = STATUS_STYLE[r.status] ?? { label: r.status, color: "#777", bg: "#F3F4F6" };
            const date = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const completedDate = r.referrer_rewarded_at
              ? new Date(r.referrer_rewarded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : null;

            return (
              <div key={r.id}
                className="grid grid-cols-[1fr_1fr_100px_80px] gap-3 items-center bg-white rounded-xl border border-neutral-100 px-4 py-3 hover:border-[#C9A84C]/30 transition-colors">
                {/* Referrer */}
                <div>
                  <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{fullName(r.referrer)}</p>
                  {r.referrer?.email && (
                    <p className="text-[11px] text-neutral-400 truncate">{r.referrer.email}</p>
                  )}
                </div>
                {/* Referee */}
                <div>
                  <p className="text-[13px] text-[#1C1C1C] truncate">{fullName(r.referee)}</p>
                  {r.referee?.email && (
                    <p className="text-[11px] text-neutral-400 truncate">{r.referee.email}</p>
                  )}
                </div>
                {/* Date */}
                <div>
                  <p className="text-[12px] text-neutral-500">{date}</p>
                  {completedDate && (
                    <p className="text-[10px] text-emerald-600">✓ {completedDate}</p>
                  )}
                </div>
                {/* Status badge */}
                <div>
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ color: st.color, background: st.bg }}>
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

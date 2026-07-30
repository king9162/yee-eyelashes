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

const STATUS_STYLE: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: "Pending",   color: "#92400E", dot: "#F59E0B" },
  completed: { label: "Completed", color: "#065F46", dot: "#10B981" },
  rewarded:  { label: "Rewarded",  color: "#1D4ED8", dot: "#3B82F6" },
  cancelled: { label: "Cancelled", color: "#991B1B", dot: "#EF4444" },
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
      const referrerMatch = fullName(r.referrer).toLowerCase().includes(q) || (r.referrer?.email ?? "").toLowerCase().includes(q);
      const refereeMatch  = fullName(r.referee).toLowerCase().includes(q)  || (r.referee?.email ?? "").toLowerCase().includes(q);
      return referrerMatch || refereeMatch;
    }
    return true;
  });

  const pendingCount   = referrals.filter(r => r.status === "pending").length;
  const completedCount = referrals.filter(r => ["completed","rewarded"].includes(r.status)).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>

      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C9A84C] mb-1">Member Club</p>
        <h1 className="text-[32px] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
          Referrals
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total",     value: referrals.length, accent: false },
          { label: "Pending",   value: pendingCount,     accent: false },
          { label: "Completed", value: completedCount,   accent: true  },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-100 rounded-2xl px-6 py-5">
            <p className="text-[30px] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)", color: s.accent ? "#C9A84C" : undefined }}>
              {s.value}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Tabs row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full border border-[#D4CCC0] bg-white rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </div>
        <div className="flex bg-white border border-neutral-100 rounded-xl overflow-hidden">
          {(["all", "pending", "completed"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all ${
                tab === t ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-700"
              }`}>
              {t === "all" ? "All" : t === "pending" ? "Pending" : "Done"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl py-24 text-center">
          <p className="text-[13px] text-neutral-400">No referrals found</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_120px_90px] gap-4 px-6 py-3 border-b border-neutral-50">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">Referrer</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">Referred Friend</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">Date</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">Status</p>
          </div>

          <div className="divide-y divide-neutral-50">
            {filtered.map(r => {
              const st = STATUS_STYLE[r.status] ?? { label: r.status, color: "#777", dot: "#aaa" };
              const date = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const completedDate = r.referrer_rewarded_at
                ? new Date(r.referrer_rewarded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : null;

              return (
                <div key={r.id}
                  className="grid grid-cols-[1fr_1fr_120px_90px] gap-4 items-center px-6 py-4 hover:bg-neutral-50/60 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{fullName(r.referrer)}</p>
                    {r.referrer?.email && (
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{r.referrer.email}</p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#1C1C1C] truncate">{fullName(r.referee)}</p>
                    {r.referee?.email && (
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{r.referee.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] text-neutral-500">{date}</p>
                    {completedDate && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">✓ {completedDate}</p>
                    )}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: st.color }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

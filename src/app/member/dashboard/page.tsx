"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Profile = {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  vip_tier: "member" | "silver" | "gold" | "diamond";
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
  created_at: string;
};

const TIER_CONFIG = {
  member:  { label: "Member",  color: "#888",    next: "Silver",  threshold: 500  },
  silver:  { label: "Silver",  color: "#C0C0C0", next: "Gold",    threshold: 1500 },
  gold:    { label: "Gold",    color: "#C9A84C", next: "Diamond", threshold: 3000 },
  diamond: { label: "Diamond", color: "#A8DAFF", next: null,      threshold: null },
};

const TXN_LABELS: Record<string, string> = {
  purchase_earned:   "Points Earned",
  referral_reward:   "Referral Reward",
  birthday_bonus:    "Birthday Reward",
  promotion_bonus:   "Promotion Bonus",
  manual_adjustment: "Manual Adjustment",
  redemption:        "Points Redeemed",
  refund_adjustment: "Refund Adjustment",
  expired:           "Points Expired",
};

export default function MemberDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }
      setUser(session.user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(prof ?? null);

      if (prof) {
        const { data: t } = await supabase
          .from("points_transactions")
          .select("id, type, amount, balance_after, notes, created_at")
          .eq("member_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        setTxns(t ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.replace("/member/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[14px] text-neutral-500">Setting up your account…</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-[12px] text-[#C9A84C] underline">
            Reload
          </button>
        </div>
      </div>
    );
  }

  const tier = TIER_CONFIG[profile.vip_tier];
  const avatarUrl = (user?.user_metadata?.avatar_url as string) ?? "";
  const spendToNext = tier.threshold ? tier.threshold - profile.total_spend_all_time : 0;

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <header className="bg-[#0F0F0F] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
          <p className="text-[10px] text-neutral-500">Member Club</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/member/profile")}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors">
            Edit Profile
          </button>
          <button onClick={signOut} className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Member card */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1C1C1C 0%, #2D2008 100%)" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
            style={{ background: "#C9A84C", transform: "translate(30%, -30%)" }} />

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-[16px]">
                  {profile.first_name[0] ?? "M"}
                </div>
              )}
              <div>
                <p className="text-[15px] font-semibold">{profile.first_name} {profile.last_name}</p>
                <p className="text-[11px] text-neutral-400">{profile.member_id}</p>
              </div>
            </div>
            <TierBadge tier={profile.vip_tier} />
          </div>

          <div>
            <p className="text-[11px] text-neutral-400 mb-1">Points Balance</p>
            <p className="text-[40px] font-light leading-none" style={{ fontFamily: "var(--font-cormorant)" }}>
              {profile.points_balance.toLocaleString()}
              <span className="text-[18px] text-neutral-400 ml-1">pts</span>
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              ≈ ${(profile.points_balance / 100).toFixed(0)} off your next visit
            </p>
          </div>

          {tier.next && tier.threshold && (
            <div className="mt-5">
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1.5">
                <span>To {tier.next}</span>
                <span>{spendToNext > 0 ? `$${spendToNext.toFixed(0)} away` : "Reached"}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    background: tier.color,
                    width: `${Math.min(100, (profile.total_spend_all_time / tier.threshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Spent",  value: `$${profile.total_spend_all_time.toFixed(0)}` },
            { label: "Visits",       value: `${profile.total_visits_all_time}` },
            { label: "Last Visit",   value: profile.last_visit_date
              ? new Date(profile.last_visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—"
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3.5 text-center border border-neutral-100">
              <p className="text-[18px] font-semibold text-[#1C1C1C]">{s.value}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Book CTA */}
        <a
          href="/en/booking"
          className="block text-[#1C1C1C] font-semibold text-[13px] text-center py-3.5 rounded-xl transition-colors"
          style={{ background: "#C9A84C" }}
        >
          Book an Appointment
        </a>

        {/* VIP benefits */}
        <TierBenefitsCard tier={profile.vip_tier} />

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-neutral-100">
            <p className="text-[13px] font-semibold text-[#1C1C1C]">Points History</p>
          </div>
          {txns.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-neutral-400">No points history yet</p>
              <p className="text-[11px] text-neutral-300 mt-1">Book an appointment to start earning points</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#1C1C1C]">{TXN_LABELS[t.type] ?? t.type}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {t.notes && ` · ${t.notes}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[14px] font-semibold ${t.amount > 0 ? "text-[#C9A84C]" : "text-neutral-500"}`}>
                      {t.amount > 0 ? `+${t.amount}` : t.amount} pts
                    </p>
                    <p className="text-[10px] text-neutral-300">{t.balance_after} remaining</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-neutral-400 pb-4">
          Member ID: {profile.member_id} · Joined {new Date(profile.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Profile["vip_tier"] }) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
      style={{ color: config.color, background: `${config.color}22`, border: `1px solid ${config.color}44` }}
    >
      {config.label}
    </span>
  );
}

function TierBenefitsCard({ tier }: { tier: Profile["vip_tier"] }) {
  const benefits: Record<Profile["vip_tier"], string[]> = {
    member:  ["Earn 1 pt per $1 spent", "Birthday reward — 30% off", "Points valid for 12 months"],
    silver:  ["Earn 1.2 pts per $1 spent", "Birthday reward — 30% off", "Priority booking", "Exclusive Silver coupons"],
    gold:    ["Earn 1.5 pts per $1 spent", "Birthday reward — 35% off", "Priority booking", "Seasonal VIP gift"],
    diamond: ["Earn 2 pts per $1 spent", "Birthday reward — 40% off", "VIP priority booking", "Monthly exclusive gift", "Free treatment upgrade"],
  };

  const config = TIER_CONFIG[tier];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4">
      <p className="text-[12px] font-bold mb-3" style={{ color: config.color }}>
        {config.label} Benefits
      </p>
      <div className="space-y-2">
        {benefits[tier].map((b) => (
          <div key={b} className="flex items-center gap-2">
            <span className="text-[#C9A84C] text-[9px]">✦</span>
            <p className="text-[12px] text-neutral-600">{b}</p>
          </div>
        ))}
      </div>
      {config.next && (
        <p className="text-[11px] text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
          Upgrade to {config.next} to unlock more benefits →
        </p>
      )}
    </div>
  );
}

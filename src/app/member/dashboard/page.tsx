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
  referral_code: string | null;
  birthday: string | null;
};

type Booking = {
  id: string;
  date: string;
  time: string | null;
  service_label: string | null;
  service: string | null;
  status: string;
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
  silver:  { label: "Silver",  color: "#C0C0C0", next: "Gold",    threshold: 1000 },
  gold:    { label: "Gold",    color: "#C9A84C", next: "Diamond", threshold: 2000 },
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
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [couponCount, setCouponCount] = useState(0);
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

      // Fetch bookings + coupons in parallel, and fire birthday check
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [bkRes, cpRes] = await Promise.all([
        fetch("/api/member/bookings",        { headers }),
        fetch("/api/member/coupons",         { headers }),
        fetch("/api/member/birthday-check",  { method: "POST", headers }),
      ]);
      const [bkData, cpData] = await Promise.all([bkRes.json(), cpRes.json()]);

      const today = new Date().toISOString().split("T")[0];
      const upcoming = (Array.isArray(bkData) ? bkData : []).filter(
        (b: Booking) => b.date >= today && !["cancelled", "completed", "no-show"].includes(b.status)
      );
      setUpcomingBooking(upcoming[upcoming.length - 1] ?? null); // earliest upcoming
      setCouponCount((Array.isArray(cpData) ? cpData : []).filter(
        (c: { status: string }) => c.status === "available"
      ).length);

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
        <button onClick={signOut} className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors">
          Sign Out
        </button>
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

        {/* Upcoming appointment */}
        {upcomingBooking && (
          <div className="bg-white rounded-2xl border border-[#C9A84C]/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] mb-2">Next Appointment</p>
            <p className="text-[14px] font-semibold text-[#1C1C1C]">
              {upcomingBooking.service_label ?? upcomingBooking.service ?? "Appointment"}
            </p>
            <p className="text-[12px] text-neutral-400 mt-0.5">
              {new Date(upcomingBooking.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              {upcomingBooking.time ? ` at ${upcomingBooking.time}` : ""}
            </p>
          </div>
        )}

        {/* Refill countdown */}
        {profile.last_visit_date && <RefillCard lastVisitDate={profile.last_visit_date} />}

        {/* Quick links row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Appointments", icon: "📅", href: "/member/bookings" },
            { label: `Coupons${couponCount > 0 ? ` (${couponCount})` : ""}`, icon: "🎟", href: "/member/coupons" },
            { label: "Edit Profile", icon: "✎", href: "/member/profile" },
          ].map(item => (
            <a key={item.label} href={item.href}
              className="bg-white rounded-xl border border-neutral-100 p-3 text-center hover:border-[#C9A84C]/40 transition-colors">
              <p className="text-[18px] mb-1">{item.icon}</p>
              <p className="text-[10px] text-neutral-500 font-semibold leading-tight">{item.label}</p>
            </a>
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

        {/* Referral */}
        {profile.referral_code && <ReferralCard code={profile.referral_code} />}

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

function RefillCard({ lastVisitDate }: { lastVisitDate: string }) {
  const last = new Date(lastVisitDate + "T12:00:00");
  const today = new Date();
  const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  let refillType = "";
  let daysToNext = 0;
  let daysToFullSet = Math.max(0, 24 - days);
  let urgency: "green" | "yellow" | "red" = "green";

  if (days <= 7) {
    refillType = "1-Week Refill";
    daysToNext = 8 - days;
    urgency = "green";
  } else if (days <= 14) {
    refillType = "2-Week Refill";
    daysToNext = 15 - days;
    urgency = "yellow";
  } else if (days <= 23) {
    refillType = "3-Week Refill";
    daysToNext = 24 - days;
    urgency = "red";
  } else {
    refillType = "New Full Set";
    daysToFullSet = 0;
    urgency = "red";
  }

  const barColor = urgency === "green" ? "#22C55E" : urgency === "yellow" ? "#C9A84C" : "#EF4444";
  const barPct = Math.min(100, (days / 24) * 100);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-3">Refill Status</p>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[20px] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Day {days}
          </p>
          <p className="text-[12px] font-semibold mt-0.5" style={{ color: barColor }}>
            {refillType}
          </p>
        </div>
        <div className="text-right">
          {daysToFullSet > 0 ? (
            <p className="text-[11px] text-neutral-400">{daysToFullSet} days to New Full Set</p>
          ) : (
            <p className="text-[11px] text-red-500 font-semibold">New Full Set recommended</p>
          )}
          {daysToNext > 0 && refillType !== "New Full Set" && (
            <p className="text-[10px] text-neutral-300 mt-0.5">{daysToNext} days to next stage</p>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ background: barColor, width: `${barPct}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-neutral-300 mt-1.5">
        <span>Last visit: {last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span>Day 24 → New Full Set</span>
      </div>
      <a href="/en/booking"
        className="mt-3 block text-center text-[12px] font-semibold text-[#C9A84C] hover:underline">
        Book {refillType} →
      </a>
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

function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4">
      <p className="text-[12px] font-bold text-[#1C1C1C] mb-1">Refer a Friend</p>
      <p className="text-[11px] text-neutral-400 mb-3">
        Share your code — when a friend joins, you both earn bonus points.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-[#F8F5EF] rounded-xl px-4 py-2.5 text-center">
          <p className="text-[17px] font-bold tracking-[0.2em] text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
            {code}
          </p>
        </div>
        <button
          onClick={copy}
          className="px-4 py-2.5 rounded-xl text-[11px] font-semibold transition-all"
          style={{ background: copied ? "#22C55E" : "#1C1C1C", color: "#fff" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
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

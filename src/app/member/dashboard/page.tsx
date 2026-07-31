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
  total_visits_all_time: number;
  last_visit_date: string | null;
  joined_at: string;
  referral_code: string | null;
  referred_by: string | null;
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

const TIER_CONFIG = {
  member:  { label: "Member",  color: "#888",    next: "Silver",  threshold: 5  },
  silver:  { label: "Silver",  color: "#C0C0C0", next: "Gold",    threshold: 10 },
  gold:    { label: "Gold",    color: "#C9A84C", next: "Diamond", threshold: 20 },
  diamond: { label: "Diamond", color: "#A8DAFF", next: null,      threshold: null },
};

function calcTier(visits: number): Profile["vip_tier"] {
  if (visits >= 20) return "diamond";
  if (visits >= 10) return "gold";
  if (visits >= 5)  return "silver";
  return "member";
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [couponCount, setCouponCount] = useState(0);
  const [referralStats, setReferralStats] = useState<{ pending: number; completed: number }>({ pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }
      setUser(session.user);
      setToken(session.access_token);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(prof ?? null);

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [bkRes, cpRes, refRes] = await Promise.all([
        fetch("/api/member/bookings",        { headers }),
        fetch("/api/member/coupons",         { headers }),
        fetch("/api/member/referrals",       { headers }),
        fetch("/api/member/birthday-check",  { method: "POST", headers }),
      ]);
      const [bkData, cpData, refData] = await Promise.all([bkRes.json(), cpRes.json(), refRes.json()]);

      const today = new Date().toISOString().split("T")[0];
      const upcoming = (Array.isArray(bkData) ? bkData : []).filter(
        (b: Booking) => b.date >= today && !["cancelled", "completed", "no-show"].includes(b.status)
      );
      setUpcomingBooking(upcoming[upcoming.length - 1] ?? null);
      setCouponCount((Array.isArray(cpData) ? cpData : []).filter(
        (c: { status: string }) => c.status === "available"
      ).length);

      if (Array.isArray(refData)) {
        setReferralStats({
          pending:   refData.filter((r: { status: string }) => r.status === "pending").length,
          completed: refData.filter((r: { status: string }) => r.status === "completed").length,
        });
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

  const visits = profile.total_visits_all_time;
  const currentTier = calcTier(visits);
  const tier = TIER_CONFIG[currentTier];
  const avatarUrl = (user?.user_metadata?.avatar_url as string) ?? "";
  const visitsInCycle = visits % 5;
  const visitsToNextCoupon = 5 - visitsInCycle;

  // Birthday countdown
  let birthdayCountdown: number | null = null;
  if (profile.birthday) {
    const today = new Date();
    const [bdayMonth, bdayDay] = profile.birthday.split("/").map(Number);
    if (!isNaN(bdayMonth) && !isNaN(bdayDay)) {
      let next = new Date(today.getFullYear(), bdayMonth - 1, bdayDay);
      if (next < today) next = new Date(today.getFullYear() + 1, bdayMonth - 1, bdayDay);
      birthdayCountdown = Math.ceil((next.getTime() - today.setHours(0,0,0,0)) / 86400000);
    }
  }

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
          className="rounded-2xl p-5 relative overflow-hidden border border-[#E8E4DC]"
          style={{ background: "#F8F5EF" }}
        >
          {/* Subtle gold top bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, #C9A84C, #e8c97a)" }} />

          <div className="flex items-start justify-between mb-5 pt-1">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A84C]/30" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-[#C9A84C]/40 flex items-center justify-center font-bold text-[16px]"
                  style={{ background: "#EDE9DF", color: "#C9A84C" }}>
                  {profile.first_name[0] ?? "M"}
                </div>
              )}
              <div>
                <p className="text-[15px] font-semibold text-[#1C1C1C]">{profile.first_name} {profile.last_name}</p>
                <p className="text-[11px] text-neutral-400">{profile.member_id}</p>
              </div>
            </div>
            <TierBadge tier={currentTier} />
          </div>

          {/* Visit progress toward next coupon */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Progress to 20% Off Coupon</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-[40px] font-light leading-none text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
                {visitsInCycle}<span className="text-[18px] text-neutral-400"> / 5</span>
              </p>
              {visitsInCycle === 0 && visits > 0 && (
                <p className="text-[12px] text-[#C9A84C] font-semibold mb-1">Coupon issued!</p>
              )}
            </div>
            <div className="flex gap-1.5 mb-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                  style={{ background: i <= visitsInCycle ? "#C9A84C" : "#D4CCC0" }} />
              ))}
            </div>
            <p className="text-[11px] text-neutral-400">
              {visitsInCycle === 0 && visits > 0
                ? `${visits} total visits — keep it up!`
                : `${visitsToNextCoupon} more visit${visitsToNextCoupon !== 1 ? "s" : ""} to earn 20% off`}
            </p>
          </div>

          {/* Birthday countdown + Tier progress row */}
          <div className="border-t border-[#D4CCC0]/50 pt-3 mt-1 flex items-end justify-between gap-4">
            {/* Birthday countdown */}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-0.5">Birthday</p>
              {birthdayCountdown !== null ? (
                <p className="text-[13px] font-semibold text-[#1C1C1C]">
                  {birthdayCountdown === 0
                    ? "🎂 Today!"
                    : birthdayCountdown === 1
                    ? "🎉 Tomorrow!"
                    : birthdayCountdown <= 30
                    ? `🎂 ${birthdayCountdown} days away`
                    : `${birthdayCountdown} days away`}
                </p>
              ) : (
                <a href="/member/profile"
                  className="text-[11px] text-[#C9A84C] font-semibold hover:underline">
                  + Add birthday →
                </a>
              )}
            </div>

            {/* Tier progress */}
            {tier.next && tier.threshold && (
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>To {tier.next}</span>
                  <span>{visits < tier.threshold ? `${tier.threshold - visits} visits away` : "Reached"}</span>
                </div>
                <div className="h-1 bg-[#D4CCC0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      background: tier.color === "#888" ? "#C9A84C" : tier.color,
                      width: `${Math.min(100, (visits / tier.threshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Visits", value: `${visits}` },
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
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Appointments", icon: "📅", href: "/member/bookings" },
            { label: `Coupons${couponCount > 0 ? ` (${couponCount})` : ""}`, icon: "🎟", href: "/member/coupons" },
            { label: "Lash Passport", icon: "✦", href: "/member/lash-records" },
            { label: "Edit Profile",  icon: "👤", href: "/member/profile" },
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
        <TierBenefitsCard tier={currentTier} />

        {/* Referral */}
        <ReferralCard
          code={profile.referral_code}
          referredBy={profile.referred_by}
          stats={referralStats}
          token={token}
        />

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

function ReferralCard({ code, referredBy, stats, token }: {
  code: string | null;
  referredBy: string | null;
  stats: { pending: number; completed: number };
  token: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [applied, setApplied] = useState(!!referredBy);

  function copy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink() {
    if (!code) return;
    const url = `https://www.yeeeyelashes.com/member?ref=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  async function applyReferral() {
    if (!inputCode.trim()) return;
    setApplying(true); setApplyMsg("");
    const res = await fetch("/api/member/apply-referral", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ referral_code: inputCode.trim().toUpperCase() }),
    });
    const data = await res.json();
    setApplying(false);
    if (res.ok) {
      setApplied(true);
      setApplyMsg(`✓ Referral applied — linked to ${data.referrer_name ?? "your friend"}`);
    } else {
      setApplyMsg(data.error ?? "Failed to apply code");
    }
  }

  const total = stats.pending + stats.completed;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-4">

      {/* Your code to share */}
      {code && (
        <div>
          <div className="flex items-start justify-between mb-1">
            <p className="text-[12px] font-bold text-[#1C1C1C]">Refer a Friend</p>
            {total > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C]">
                {total} referred
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 mb-2">Share your link and help friends discover Yee Eyelashes.</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-[#F8F5EF] rounded-xl px-4 py-2.5 text-center">
              <p className="text-[17px] font-bold tracking-[0.2em] text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
                {code}
              </p>
            </div>
            <button onClick={copy}
              className="px-4 py-2.5 rounded-xl text-[11px] font-semibold transition-all"
              style={{ background: copied ? "#22C55E" : "#1C1C1C", color: "#fff" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-semibold border transition-all"
            style={{
              background: copiedLink ? "#22C55E22" : "#F8F5EF",
              borderColor: copiedLink ? "#22C55E" : "#C9A84C",
              color: copiedLink ? "#22C55E" : "#C9A84C",
            }}>
            {copiedLink ? "✓ Link Copied!" : "✦ Copy Share Link"}
          </button>
          {total > 0 && (
            <div className="flex gap-3 pt-2 border-t border-neutral-50 mt-2">
              {stats.completed > 0 && <p className="text-[11px] text-emerald-600 font-semibold">✓ {stats.completed} completed</p>}
              {stats.pending > 0 && <p className="text-[11px] text-amber-600">⏳ {stats.pending} pending first visit</p>}
            </div>
          )}
        </div>
      )}

      {/* Enter a friend's code */}
      <div className="border-t border-neutral-50 pt-3">
        <p className="text-[12px] font-bold text-[#1C1C1C] mb-1">Have a Referral Code?</p>
        {applied ? (
          <p className="text-[11px] text-emerald-600 font-semibold">
            {applyMsg || "✓ Referral code already applied"}
          </p>
        ) : (
          <>
            <p className="text-[11px] text-neutral-400 mb-2">Enter a friend's code to link your accounts.</p>
            <div className="flex gap-2">
              <input
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC12345"
                maxLength={12}
                className="flex-1 border border-[#D4CCC0] bg-white rounded-xl px-3 py-2.5 text-[13px] font-mono tracking-widest text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors uppercase"
              />
              <button onClick={applyReferral} disabled={applying || !inputCode.trim()}
                className="px-4 py-2.5 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-40"
                style={{ background: "#1C1C1C", color: "#fff" }}>
                {applying ? "…" : "Apply"}
              </button>
            </div>
            {applyMsg && (
              <p className={`text-[11px] mt-1.5 font-semibold ${applyMsg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>
                {applyMsg}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TierBenefitsCard({ tier }: { tier: Profile["vip_tier"] }) {
  const benefits: Record<Profile["vip_tier"], string[]> = {
    member:  ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "Member-only promotions"],
    silver:  ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "Priority booking", "Exclusive Silver coupons"],
    gold:    ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "Priority booking", "Seasonal VIP gift"],
    diamond: ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "VIP priority booking", "Monthly exclusive gift", "Free treatment upgrade"],
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
      {config.next && config.threshold && (
        <p className="text-[11px] text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
          Reach {config.threshold} visits to unlock {config.next} benefits →
        </p>
      )}
    </div>
  );
}

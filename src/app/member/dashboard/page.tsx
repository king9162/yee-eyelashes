"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import MemberBottomNav from "@/components/MemberBottomNav";

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
  admin_notes: string | null;
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

const TIER_CARD_STYLE: Record<Profile["vip_tier"], {
  bg: string; accent: string; text: string; sub: string; bar: string; barBg: string; activeBg: string;
}> = {
  member:  { bg: "linear-gradient(135deg, #141414 0%, #2C2C2C 60%, #1a1a1a 100%)",                 accent: "#C9A84C", text: "#fff", sub: "rgba(255,255,255,0.45)", bar: "#C9A84C", barBg: "rgba(255,255,255,0.1)",  activeBg: "#2a2a2a" },
  silver:  { bg: "linear-gradient(135deg, #4a4a4a 0%, #969696 45%, #636363 100%)",                 accent: "#fff",    text: "#fff", sub: "rgba(255,255,255,0.55)", bar: "#fff",    barBg: "rgba(255,255,255,0.18)", activeBg: "#6a6a6a" },
  gold:    { bg: "linear-gradient(135deg, #6b4410 0%, #C9A84C 38%, #f0d88a 65%, #b8903a 100%)",   accent: "#fff",    text: "#fff", sub: "rgba(255,255,255,0.6)",  bar: "#fff",    barBg: "rgba(255,255,255,0.2)",  activeBg: "#b8903a" },
  diamond: { bg: "linear-gradient(135deg, #0a1929 0%, #0d3060 38%, #1a5296 65%, #4a90c4 100%)",   accent: "#A8DAFF", text: "#fff", sub: "rgba(168,218,255,0.55)", bar: "#A8DAFF", barBg: "rgba(168,218,255,0.15)", activeBg: "#0d3060" },
};

const TIER_ORDER: Profile["vip_tier"][] = ["member", "silver", "gold", "diamond"];
const TIER_VISITS_REQ: Record<Profile["vip_tier"], number> = { member: 0, silver: 5, gold: 10, diamond: 20 };
const TIER_BENEFITS: Record<Profile["vip_tier"], string[]> = {
  member:  ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "Member-only promotions"],
  silver:  ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "Priority booking", "Exclusive Silver coupons"],
  gold:    ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "Priority booking", "Seasonal VIP gift"],
  diamond: ["Every 5 visits → 20% off coupon", "Birthday reward — 20% off", "VIP priority booking", "Monthly exclusive gift", "Free treatment upgrade"],
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
  const [activePackages, setActivePackages] = useState<{ id: string; notes: string | null; purchase_date: string | null; use1_date: string | null; use2_date: string | null; use3_date: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<Profile["vip_tier"]>("member");

  useEffect(() => {
    if (profile) setSelectedTier(calcTier(profile.total_visits_all_time));
  }, [profile]);

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
      const [bkRes, cpRes, refRes, pkgRes] = await Promise.all([
        fetch("/api/member/bookings",        { headers }),
        fetch("/api/member/coupons",         { headers }),
        fetch("/api/member/referrals",       { headers }),
        fetch("/api/member/packages",        { headers }),
        fetch("/api/member/birthday-check",  { method: "POST", headers }),
      ]);
      const [bkData, cpData, refData, pkgData] = await Promise.all([bkRes.json(), cpRes.json(), refRes.json(), pkgRes.json()]);

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

      if (Array.isArray(pkgData)) {
        setActivePackages(pkgData.filter((p: { use1_date: string | null; use2_date: string | null; use3_date: string | null }) =>
          [p.use1_date, p.use2_date, p.use3_date].filter(Boolean).length < 3
        ));
      }

      setLoading(false);
    }

    load();
  }, [router]);

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
  const cardStyle = TIER_CARD_STYLE[currentTier];
  const avatarUrl = (user?.user_metadata?.avatar_url as string) ?? "";
  const visitsInCycle = visits % 5;
  const visitsToNextCoupon = 5 - visitsInCycle;

  // Birthday countdown — birthday stored as YYYY-MM-DD
  let birthdayCountdown: number | null = null;
  let birthdayDisplay: string | null = null;
  if (profile.birthday) {
    const parts = profile.birthday.split("-").map(Number);
    const bdayMonth = parts[1], bdayDay = parts[2];
    if (bdayMonth && bdayDay) {
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let next = new Date(today.getFullYear(), bdayMonth - 1, bdayDay);
      if (next < todayMidnight) next = new Date(today.getFullYear() + 1, bdayMonth - 1, bdayDay);
      birthdayCountdown = Math.ceil((next.getTime() - todayMidnight.getTime()) / 86400000);
      birthdayDisplay = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <header className="bg-[#0F0F0F] px-5 py-4">
        <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
        <p className="text-[10px] text-neutral-500">Member Club</p>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-4">
        {/* Premium member card */}
        <div className="rounded-[20px] overflow-hidden shadow-lg relative" style={{ background: cardStyle.bg }}>
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-end pr-5 pointer-events-none select-none">
            <span style={{ fontSize: 110, color: "rgba(255,255,255,0.04)", fontFamily: "var(--font-cormorant)", lineHeight: 1 }}>✦</span>
          </div>

          {/* Card body */}
          <div className="relative px-5 pt-5 pb-4">
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[7px] tracking-[0.3em] uppercase font-semibold mb-3" style={{ color: cardStyle.sub }}>
                  Yee Eyelashes
                </p>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      style={{ border: `1.5px solid ${cardStyle.accent}50` }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px] flex-shrink-0"
                      style={{ background: `${cardStyle.accent}20`, color: cardStyle.accent, border: `1.5px solid ${cardStyle.accent}40` }}>
                      {profile.first_name[0] ?? "M"}
                    </div>
                  )}
                  <div>
                    <p className="text-[20px] font-light leading-none" style={{ color: cardStyle.text, fontFamily: "var(--font-cormorant)" }}>
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-[10px] font-mono tracking-wider mt-0.5" style={{ color: cardStyle.sub }}>
                      {profile.member_id}
                    </p>
                  </div>
                </div>
              </div>
              {/* Tier badge */}
              <span className="text-[8px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full mt-1 flex-shrink-0"
                style={{ color: cardStyle.accent, background: "rgba(255,255,255,0.1)", border: `1px solid ${cardStyle.accent}40` }}>
                {TIER_CONFIG[currentTier].label}
              </span>
            </div>

            {/* Tier progress bar */}
            {tier.next && tier.threshold ? (
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[8px] uppercase tracking-[0.1em]" style={{ color: cardStyle.sub }}>To {tier.next}</span>
                  <span className="text-[8px]" style={{ color: cardStyle.sub }}>{visits} / {tier.threshold} visits</span>
                </div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: cardStyle.barBg }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ background: cardStyle.bar, width: `${Math.min(100, (visits / tier.threshold) * 100)}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <p className="text-[38px] font-light leading-none" style={{ color: cardStyle.text, fontFamily: "var(--font-cormorant)" }}>
                  {visits}
                </p>
                <p className="text-[11px]" style={{ color: cardStyle.sub }}>lifetime visits · Diamond</p>
              </div>
            )}
          </div>

          {/* Footer strip */}
          <div className="relative px-5 py-3 flex items-center justify-between"
            style={{ background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Coupon dots */}
            <div>
              <p className="text-[7px] uppercase tracking-[0.12em] mb-1.5" style={{ color: cardStyle.sub }}>
                {visitsInCycle === 0 && visits > 0 ? "Coupon ready!" : `${visitsToNextCoupon} to next coupon`}
              </p>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{ background: i <= visitsInCycle ? cardStyle.bar : cardStyle.barBg }} />
                ))}
              </div>
            </div>
            {/* Birthday */}
            {birthdayDisplay ? (
              <div className="text-right">
                <p className="text-[7px] uppercase tracking-[0.1em] mb-0.5" style={{ color: cardStyle.sub }}>Birthday</p>
                <p className="text-[12px] font-medium" style={{ color: cardStyle.text }}>{birthdayDisplay}</p>
                {birthdayCountdown !== null && birthdayCountdown <= 30 && (
                  <p className="text-[9px] font-semibold mt-0.5" style={{ color: cardStyle.accent }}>
                    {birthdayCountdown === 0 ? "Today!" : birthdayCountdown === 1 ? "Tomorrow!" : `${birthdayCountdown}d away`}
                  </p>
                )}
              </div>
            ) : (
              <a href="/member/profile" className="text-right" style={{ color: cardStyle.sub }}>
                <p className="text-[7px] uppercase tracking-[0.1em] mb-0.5">Birthday</p>
                <p className="text-[10px]">Not set</p>
              </a>
            )}
          </div>
        </div>

        {/* Edit profile link */}
        <div className="flex justify-end -mt-1">
          <a href="/member/profile" className="text-[10px] text-neutral-400 hover:text-[#C9A84C] transition-colors">
            Edit profile →
          </a>
        </div>

        {/* Admin notes — read-only */}
        {profile.admin_notes && (
          <div className="bg-white rounded-xl border border-neutral-100 px-4 py-3">
            <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-1">Notes from Yee</p>
            <p className="text-[13px] text-[#1C1C1C] leading-relaxed whitespace-pre-wrap">{profile.admin_notes}</p>
          </div>
        )}

        {/* Stats + Quick links — 4-grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3.5 text-center border border-neutral-100">
            <p className="text-[18px] font-semibold text-[#1C1C1C]">{visits}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Total Visits</p>
          </div>
          <div className="bg-white rounded-xl p-3.5 text-center border border-neutral-100">
            <p className="text-[18px] font-semibold text-[#1C1C1C]">
              {profile.last_visit_date
                ? new Date(profile.last_visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"}
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Last Visit</p>
          </div>
          <a href="/member/bookings"
            className="bg-white rounded-xl border border-neutral-100 p-3 text-center hover:border-[#C9A84C]/40 transition-colors">
            <p className="text-[18px] mb-1">📅</p>
            <p className="text-[10px] text-neutral-500 font-semibold leading-tight">Appointments</p>
          </a>
          <a href="/member/coupons"
            className="bg-white rounded-xl border border-neutral-100 p-3 text-center hover:border-[#C9A84C]/40 transition-colors">
            <p className="text-[18px] mb-1">🎟</p>
            <p className="text-[10px] text-neutral-500 font-semibold leading-tight">
              {couponCount > 0 ? `Coupons (${couponCount})` : "Coupons"}
            </p>
          </a>
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

        {/* 3x Package cards — only shown if member has active packages */}
        {activePackages.map(pkg => {
          const used = [pkg.use1_date, pkg.use2_date, pkg.use3_date].filter(Boolean).length;
          const fmtD = (d: string | null) => d
            ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : null;
          return (
            <div key={pkg.id} className="bg-white rounded-2xl border border-[#C9A84C]/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] mb-0.5">3× Package</p>
                  <p className="text-[13px] font-semibold text-[#1C1C1C]">{pkg.notes ?? "Package"}</p>
                </div>
                <span className="text-[11px] font-semibold text-neutral-500">{used}/3 used</span>
              </div>
              <div className="flex gap-3">
                {([1, 2, 3] as const).map(slot => {
                  const key = `use${slot}_date` as "use1_date" | "use2_date" | "use3_date";
                  const dateVal = pkg[key];
                  return (
                    <div key={slot} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center
                        ${dateVal ? "bg-[#1C1C1C] border-[#1C1C1C]" : "border-[#D4CCC0]"}`}>
                        {dateVal
                          ? <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span className="text-[13px] font-bold text-[#C9A84C]">{slot}</span>}
                      </div>
                      <p className="text-[10px] text-neutral-400 text-center">
                        {fmtD(dateVal) ?? `Session ${slot}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Book CTA */}
        <a
          href="/"
          className="block text-[#1C1C1C] font-semibold text-[13px] text-center py-3.5 rounded-xl transition-colors"
          style={{ background: "#C9A84C" }}
        >
          Book an Appointment
        </a>

        {/* Tier selector + benefits */}
        <div>
          <div className="flex gap-2 mb-3">
            {TIER_ORDER.map(t => {
              const isSelected = selectedTier === t;
              const isCurrent = t === currentTier;
              const cs = TIER_CARD_STYLE[t];
              const unlocked = visits >= TIER_VISITS_REQ[t];
              return (
                <button key={t} onClick={() => setSelectedTier(t)}
                  className="flex-1 py-2.5 rounded-xl transition-all"
                  style={{
                    background: isSelected ? cs.activeBg : "#fff",
                    border: isSelected ? "none" : "1px solid #E8E4DC",
                    boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                  }}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: isSelected ? "#fff" : "#1C1C1C" }}>
                    {TIER_CONFIG[t].label}
                  </p>
                  {isCurrent && (
                    <p className="text-[7px] mt-0.5 font-semibold"
                      style={{ color: isSelected ? `${cs.accent}cc` : "#C9A84C" }}>
                      ✦ Current
                    </p>
                  )}
                  {!isCurrent && unlocked && (
                    <p className="text-[7px] mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "#22C55E" }}>✓</p>
                  )}
                  {!isCurrent && !unlocked && (
                    <p className="text-[7px] mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.5)" : "#C0BAB0" }}>
                      {TIER_VISITS_REQ[t] - visits}v
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Benefits panel */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-[#1C1C1C]">
                {TIER_CONFIG[selectedTier].label} Benefits
              </p>
              {selectedTier === currentTier ? (
                <span className="text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ color: TIER_CARD_STYLE[selectedTier].activeBg, background: `${TIER_CARD_STYLE[selectedTier].activeBg}1a` }}>
                  Your tier
                </span>
              ) : visits >= TIER_VISITS_REQ[selectedTier] ? (
                <span className="text-[9px] font-bold text-green-600">✓ Unlocked</span>
              ) : (
                <span className="text-[9px] text-neutral-400">
                  {TIER_VISITS_REQ[selectedTier] - visits} visits to unlock
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {TIER_BENEFITS[selectedTier].map(b => (
                <div key={b} className="flex items-start gap-2.5">
                  <span className="text-[#C9A84C] text-[9px] mt-0.5 flex-shrink-0">✦</span>
                  <p className="text-[12px] text-neutral-600 leading-snug">{b}</p>
                </div>
              ))}
            </div>
            {selectedTier === currentTier && TIER_CONFIG[selectedTier].next && tier.threshold && (
              <p className="text-[11px] text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
                {tier.threshold - visits > 0
                  ? `${tier.threshold - visits} more visits to unlock ${TIER_CONFIG[selectedTier].next} →`
                  : `${TIER_CONFIG[selectedTier].next} unlocked →`}
              </p>
            )}
            {selectedTier === currentTier && !TIER_CONFIG[selectedTier].next && (
              <p className="text-[11px] text-[#A8DAFF] font-semibold mt-3 pt-3 border-t border-neutral-100">
                ✦ You&apos;ve reached the highest tier
              </p>
            )}
          </div>
        </div>

        {/* Referral */}
        <ReferralCard
          code={profile.referral_code}
          referredBy={profile.referred_by}
          stats={referralStats}
          token={token}
        />

        {/* Footer */}
        <p className="text-center text-[11px] text-neutral-400 pb-2">
          Member ID: {profile.member_id} · Joined {new Date(profile.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <MemberBottomNav />
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
      <a href="/"
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

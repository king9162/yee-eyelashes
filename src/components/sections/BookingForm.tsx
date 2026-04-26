"use client";

import { useState, useEffect } from "react";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

// ── Data ─────────────────────────────────────────────────────────────────
type Variant = { id: string; label: string; labelZh: string; price: number; duration: string };
type ServiceCard = {
  id: string;
  label: string;
  labelZh: string;
  priceMin: number;
  priceMax: number;
  durMin: string;
  durMax: string;
  variants: Variant[];
};
type ServiceGroup = {
  id: string;
  heading: string;
  headingZh: string;
  cards: ServiceCard[];
};

function mkLashCard(
  mat: "ms" | "pc",
  pcs: number,
  ns: [number, string],
  w1: [number, string],
  w2: [number, string],
  w3: [number, string],
  pkg: [number, string],
): ServiceCard {
  const label    = mat === "ms" ? "Mink / Silk" : "Premium / Cashmere";
  const labelZh  = mat === "ms" ? "Mink / Silk" : "Premium / Cashmere";
  return {
    id: `${mat}-${pcs}`,
    label:    `${label} ${pcs}pcs`,
    labelZh:  `${labelZh} ${pcs}根`,
    priceMin: w1[0],
    priceMax: ns[0],
    durMin:   w1[1],
    durMax:   ns[1],
    variants: [
      { id: "ns",  label: "New Set",          labelZh: "全新嫁接",  price: ns[0],  duration: ns[1] },
      { id: "w1",  label: "1 Week Refill",    labelZh: "一週補睫",  price: w1[0],  duration: w1[1] },
      { id: "w2",  label: "2 Week Refill",    labelZh: "兩週補睫",  price: w2[0],  duration: w2[1] },
      { id: "w3",  label: "3 Week Refill",    labelZh: "三週補睫",  price: w3[0],  duration: w3[1] },
      { id: "pkg", label: "3 Times Package",  labelZh: "三次套裝",  price: pkg[0], duration: pkg[1] },
    ],
  };
}

function mkSimple(id: string, label: string, labelZh: string, price: number, duration: string, note?: string, noteZh?: string): ServiceCard {
  return {
    id,
    label:    note ? `${label}` : label,
    labelZh:  noteZh ? `${labelZh}` : labelZh,
    priceMin: price,
    priceMax: price,
    durMin:   duration,
    durMax:   duration,
    variants: [{ id: "only", label, labelZh, price, duration }],
  };
}

const GROUPS: ServiceGroup[] = [
  {
    id: "ms", heading: "Mink / Silk", headingZh: "Mink / Silk",
    cards: [
      mkLashCard("ms", 60,  [60,"1hr"],       [30,"30min"], [40,"40min"], [50,"50min"],    [150,"1hr"]),
      mkLashCard("ms", 80,  [80,"1hr 15min"], [40,"35min"], [50,"45min"], [70,"1hr"],      [170,"1hr 15min"]),
      mkLashCard("ms", 100, [100,"1hr 30min"],[50,"40min"], [60,"50min"], [80,"1hr 5min"], [220,"1hr 30min"]),
      mkLashCard("ms", 120, [120,"1hr 45min"],[60,"45min"], [70,"55min"], [90,"1hr 10min"],[260,"1hr 45min"]),
      mkLashCard("ms", 140, [130,"2hr"],       [70,"50min"], [80,"1hr"],  [100,"1hr 15min"],[280,"2hr"]),
      mkLashCard("ms", 180, [160,"2hr 15min"],[80,"55min"], [90,"1hr 5min"],[110,"1hr 20min"],[340,"2hr 15min"]),
    ],
  },
  {
    id: "pc", heading: "Premium / Cashmere", headingZh: "Premium / Cashmere",
    cards: [
      mkLashCard("pc", 60,  [80,"1hr"],       [50,"30min"], [60,"40min"], [70,"50min"],    [180,"1hr"]),
      mkLashCard("pc", 80,  [100,"1hr 15min"],[60,"35min"], [70,"45min"], [90,"1hr"],      [200,"1hr 15min"]),
      mkLashCard("pc", 100, [120,"1hr 30min"],[70,"40min"], [80,"50min"], [100,"1hr 5min"],[250,"1hr 30min"]),
      mkLashCard("pc", 120, [140,"1hr 45min"],[80,"45min"], [90,"55min"], [110,"1hr 10min"],[290,"1hr 45min"]),
      mkLashCard("pc", 140, [150,"2hr"],       [90,"50min"], [100,"1hr"], [120,"1hr 15min"],[310,"2hr"]),
      mkLashCard("pc", 180, [180,"2hr 15min"],[100,"55min"],[110,"1hr 5min"],[130,"1hr 20min"],[370,"2hr 15min"]),
    ],
  },
  {
    id: "fills", heading: "Fills & Care", headingZh: "補睫與護理",
    cards: [
      mkSimple("refill-1w",    "1 Week Refill",                   "一週補睫",           40,  "1hr"),
      mkSimple("refill-2w",    "2 Week Refill",                   "兩週補睫",           50,  "1hr"),
      mkSimple("refill-3w",    "3 Week Refill",                   "三週補睫",           70,  "1hr"),
      mkSimple("lash-lift",    "Eyelash Lift",                    "睫毛燙翹",           79,  "45min"),
      mkSimple("lash-tint",    "Eyelash Tinting",                 "睫毛染色",           20,  "20min"),
      mkSimple("btm-tint",     "Bottom Lash Tinting",             "下睫毛染色",         20,  "20min"),
      mkSimple("tb-tint",      "Top & Bottom Lash Tinting",       "上下睫毛染色",       30,  "30min"),
      mkSimple("brow-tint",    "Eyebrow Tinting",                 "眉毛染色",           30,  "20min"),
      mkSimple("btm-ext",      "Bottom Lash Extension",           "下睫毛嫁接",         30,  "30min"),
      mkSimple("color-ext",    "Color Lash Extension",            "彩色睫毛嫁接",       25,  "20min"),
      mkSimple("removal",      "Eyelash Removal",                 "睫毛卸除",           20,  "20min"),
      mkSimple("brow-lam-all", "Brow Lamination + Tinting + Shaping", "眉毛定型 + 染色 + 修型", 75, "45min"),
      mkSimple("brow-lam",     "Brow Lamination + Shaping",       "眉毛定型 + 修型",    60,  "35min"),
      mkSimple("wax-brow",     "Eyebrow Wax",                     "眉型蜜蠟",           10,  "15min"),
      mkSimple("wax-cheeks",   "Cheeks Wax",                      "臉頰蜜蠟",           15,  "15min"),
      mkSimple("wax-chin",     "Chin Wax",                        "下巴蜜蠟",           20,  "15min"),
      mkSimple("wax-uplip",    "Upper Lip Wax",                   "上唇蜜蠟",           10,  "10min"),
      mkSimple("wax-lowlip",   "Lower Lip Wax",                   "下唇蜜蠟",           10,  "10min"),
    ],
  },
  {
    id: "pmu", heading: "PMU", headingZh: "半永久彩妝",
    cards: [
      mkSimple("microblading",  "Microblading",                   "飄眉",               599, "2hr"),
      mkSimple("combo-brows",   "Combination Brows",              "組合眉",             650, "2hr 30min"),
      mkSimple("ombre-brows",   "Ombre Powder Brows",             "霧眉",               599, "2hr"),
      mkSimple("nano-brows",    "Nano Hairstroke Brows",          "納米髮絲眉",         599, "2hr 30min"),
      mkSimple("brow-touchup",  "6–8 Week Touch Up (Brows)",      "6–8 週補色（眉）",   150, "1hr 30min"),
      mkSimple("eyeliner",      "Classic Eyeliner — Top Liner",   "經典眼線（上眼線）", 380, "1hr 30min"),
      mkSimple("lash-enhance",  "Lash Line Enhancement",          "睫毛根部填充",       350, "1hr 15min"),
      mkSimple("btm-liner",     "Add-On Bottom Liner",            "加購下眼線",         100, "30min"),
    ],
  },
];

const TIMES = [
  "9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM",
];

function todayStr() { return new Date().toISOString().split("T")[0]; }

const CLOSING_MIN = 19 * 60; // 7:00 PM = 1140 min

function toMin(t: string): number {
  const [hhmm, period] = t.split(" ");
  let [h, m] = hhmm.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function parseDurationMin(d: string): number {
  let mins = 0;
  const hr  = d?.match(/(\d+)hr/);
  const min = d?.match(/(\d+)min/);
  if (hr)  mins += parseInt(hr[1]) * 60;
  if (min) mins += parseInt(min[1]);
  return mins || 90;
}

// ── Icons ────────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round">
      <path d="M5 13l4 4L19 7"/>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export default function BookingForm({ lang }: Props) {
  const zh = lang === "zh";

  const [step,        setStep]        = useState<1 | 2 | 3>(1);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [selectedSvc, setSelectedSvc] = useState<{ card: ServiceCard; variant: Variant } | null>(null);
  const [dateVal,     setDateVal]     = useState("");
  const [timeVal,     setTimeVal]     = useState("");
  const [info,        setInfo]        = useState({ name: "", phone: "", email: "", notes: "" });
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState("");
  const [bookedTimes,   setBookedTimes]   = useState<string[]>([]);
  const [blockedDates,  setBlockedDates]  = useState<string[]>([]);
  const [dateBlocked,   setDateBlocked]   = useState(false);

  // Fetch blocked dates once on mount
  useEffect(() => {
    fetch("/api/blocked-dates")
      .then(r => r.json())
      .then(d => setBlockedDates((d.blockedDates ?? []).map((b: { date: string }) => b.date)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dateVal) { setBookedTimes([]); setDateBlocked(false); return; }
    if (blockedDates.includes(dateVal)) { setDateBlocked(true); setBookedTimes([]); return; }
    setDateBlocked(false);
    fetch(`/api/bookings/slots?date=${dateVal}`)
      .then(r => r.json())
      .then(d => setBookedTimes(d.bookedTimes ?? []))
      .catch(() => setBookedTimes([]));
  }, [dateVal, blockedDates]);

  const setF = (k: keyof typeof info) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setInfo(p => ({ ...p, [k]: e.target.value }));

  const isSimple = (card: ServiceCard) => card.variants.length === 1 && card.variants[0].id === "only";

  function handleCardClick(card: ServiceCard) {
    if (isSimple(card)) {
      setSelectedSvc({ card, variant: card.variants[0] });
      setExpandedId(null);
      setTimeVal("");
    } else {
      setExpandedId(prev => prev === card.id ? null : card.id);
    }
  }

  function handleVariantPick(card: ServiceCard, variant: Variant) {
    setSelectedSvc({ card, variant });
    setExpandedId(null);
    setTimeVal("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSvc || !dateVal || !timeVal) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: "", // honeypot
          name: info.name, phone: info.phone, email: info.email, notes: info.notes,
          date: dateVal, time: timeVal,
          service: selectedSvc.card.id,
          serviceLabel: zh
            ? `${selectedSvc.card.labelZh} — ${selectedSvc.variant.labelZh}`
            : `${selectedSvc.card.label} — ${selectedSvc.variant.label}`,
          amount: selectedSvc.variant.price,
          duration: selectedSvc.variant.duration,
          lang,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL");
      }
    } catch {
      setError(zh ? "提交失敗，請稍後再試或直接致電我們。" : "Something went wrong. Please try again or call us directly.");
      setLoading(false);
    }
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-[560px] mx-auto px-6 pt-16 pb-32">
        <div className="text-center mb-10">
          <div className="w-12 h-12 border border-[#C9A84C]/40 flex items-center justify-center mx-auto mb-8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-4">{zh ? "預約成功" : "Booking Confirmed"}</p>
          <h2 className="text-[2rem] font-light text-[#1C1C1C] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            {zh ? `謝謝您，${info.name}` : `Thank you, ${info.name}`}
          </h2>
          <p className="text-[13px] text-neutral-400 leading-[1.9] max-w-sm mx-auto mb-3">
            {zh ? "您的預約已確認，確認信已發送至您的信箱。" : "Your appointment is confirmed. A confirmation email has been sent to you."}
          </p>
        </div>

        {selectedSvc && (
          <div className="bg-[#FAFAF8] border-l-2 border-[#C9A84C] px-6 py-6 mb-8">
            <p className="text-[9px] uppercase tracking-[0.45em] text-[#C9A84C] mb-4">{zh ? "預約摘要" : "Booking Summary"}</p>
            <div className="space-y-2.5 text-[13px]">
              {[
                [zh ? "服務" : "Service",  zh ? `${selectedSvc.card.labelZh} — ${selectedSvc.variant.labelZh}` : `${selectedSvc.card.label} — ${selectedSvc.variant.label}`],
                [zh ? "日期" : "Date",     dateVal],
                [zh ? "時間" : "Time",     timeVal],
                [zh ? "費用" : "Price",    `$${selectedSvc.variant.price}`],
                [zh ? "姓名" : "Name",     info.name],
                [zh ? "電話" : "Phone",    info.phone],
                [zh ? "信箱" : "Email",    info.email],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-neutral-400">{label}</span>
                  <span className="text-[#1C1C1C] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-[11px] text-neutral-300">
            {zh ? "確認信已發送至 " : "Confirmation sent to "}<span className="text-[#C9A84C]">{info.email}</span>
          </p>
          <p className="text-[12px] text-neutral-400">
            📍 278 Plandome Rd 2FL, Manhasset, NY · <a href="tel:9298062467" className="text-[#C9A84C]">929-806-2467</a>
          </p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full bg-white border border-neutral-200 px-4 py-3.5 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors duration-200";
  const labelCls = "block text-[9.5px] uppercase tracking-[0.4em] text-neutral-400 mb-2";

  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 pt-10 pb-32">

      {/* ── Step progress bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-0 mb-14">
        {([
          { n: 1, en: "Select Service",  zh: "選擇服務" },
          { n: 2, en: "Date & Time",     zh: "日期時間" },
          { n: 3, en: "Your Details",    zh: "填寫資料" },
          { n: 4, en: "Payment",         zh: "付款" },
        ] as const).map(({ n, en, zh: zhL }, i) => (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium border transition-all duration-300 ${
                step > n
                  ? "bg-[#C9A84C] border-[#C9A84C] text-white"
                  : step === n
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-neutral-200 text-neutral-300"
              }`}>
                {step > n ? <CheckIcon /> : n}
              </div>
              <span className={`text-[9px] uppercase tracking-[0.3em] whitespace-nowrap ${step === n ? "text-[#1C1C1C]" : "text-neutral-300"}`}>
                {zh ? zhL : en}
              </span>
            </div>
            {i < 3 && <div className="w-16 sm:w-24 h-px bg-neutral-200 mb-5 mx-2" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Service list ──────────────────────────────────────── */}
      {step === 1 && (
        <div>
          {/* Selection notice */}
          {!selectedSvc ? (
            <div className="border border-neutral-100 bg-neutral-50 px-5 py-4 mb-10 text-center">
              <p className="text-[11.5px] text-neutral-400">
                {zh ? "尚未選擇服務，請從下方選擇一項服務以繼續。" : "No service selected. Please select a service from the list below to continue."}
              </p>
            </div>
          ) : (
            <div className="border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-6 py-4 mb-10 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] mb-1">{zh ? "已選擇" : "Selected"}</p>
                <p className="text-[13px] text-[#1C1C1C]">
                  {zh ? `${selectedSvc.card.labelZh} — ${selectedSvc.variant.labelZh}` : `${selectedSvc.card.label} — ${selectedSvc.variant.label}`}
                </p>
                <p className="text-[11.5px] text-[#C9A84C] mt-0.5">${selectedSvc.variant.price} · {selectedSvc.variant.duration}</p>
              </div>
              <button
                onClick={() => setSelectedSvc(null)}
                className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-200 ml-6 flex-shrink-0"
              >
                {zh ? "更換" : "Change"}
              </button>
            </div>
          )}

          {/* Service groups */}
          {GROUPS.map(group => (
            <div key={group.id} className="mb-10">
              {/* Group heading */}
              <div className="flex items-center gap-4 mb-5">
                <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]">
                  {zh ? group.headingZh : group.heading}
                </p>
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              {/* 2-column card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.cards.map(card => {
                  const isExpanded = expandedId === card.id;
                  const isSelected = selectedSvc?.card.id === card.id;
                  const isMulti = !isSimple(card);

                  return (
                    <div
                      key={card.id}
                      className={`border transition-all duration-200 ${
                        isSelected
                          ? "border-[#C9A84C]"
                          : isExpanded
                          ? "border-[#C9A84C]/50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {/* Card header row */}
                      <button
                        onClick={() => handleCardClick(card)}
                        className="w-full px-5 py-4 text-left flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12.5px] tracking-[0.01em] leading-snug mb-2.5 ${isSelected ? "text-[#C9A84C]" : "text-[#1C1C1C]"}`}>
                            {zh ? card.labelZh : card.label}
                          </p>
                          <div className="flex items-center gap-1 text-neutral-400">
                            <ClockIcon />
                            <span className="text-[10.5px]">
                              {card.durMin === card.durMax ? card.durMin : `${card.durMin} – ${card.durMax}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5">
                          <span className="text-[13px] text-[#C9A84C]" style={{ fontFamily: "var(--font-serif)" }}>
                            {card.priceMin === card.priceMax
                              ? `$${card.priceMin}`
                              : `$${card.priceMin} – $${card.priceMax}`}
                          </span>
                          {isMulti && (
                            <span className={`text-[9px] uppercase tracking-[0.2em] transition-colors duration-200 ${isExpanded ? "text-[#C9A84C]" : "text-neutral-300"}`}>
                              {zh ? (isExpanded ? "收起 ↑" : "選項 ↓") : (isExpanded ? "Close ↑" : "Options ↓")}
                            </span>
                          )}
                          {isSelected && !isMulti && (
                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C9A84C]">
                              {zh ? "已選 ✓" : "Selected ✓"}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Expandable variant list (lash services) */}
                      {isMulti && isExpanded && (
                        <div className="border-t border-neutral-100 px-5 pt-3 pb-4 bg-neutral-50/50">
                          <div className="grid grid-cols-1 gap-1.5">
                            {card.variants.map(v => {
                              const isVSelected = selectedSvc?.card.id === card.id && selectedSvc?.variant.id === v.id;
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => handleVariantPick(card, v)}
                                  className={`w-full flex items-center justify-between px-4 py-3.5 border text-left transition-all duration-150 ${
                                    isVSelected
                                      ? "border-[#C9A84C] bg-[#C9A84C] text-white"
                                      : "border-neutral-200 bg-white hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5"
                                  }`}
                                >
                                  <span className="text-[11px] tracking-[0.02em]">{zh ? v.labelZh : v.label}</span>
                                  <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className={`text-[10.5px] ${isVSelected ? "text-white/70" : "text-neutral-400"}`}>{v.duration}</span>
                                    <span className={`text-[13px] ${isVSelected ? "text-white" : "text-[#C9A84C]"}`} style={{ fontFamily: "var(--font-serif)" }}>
                                      ${v.price}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Continue */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <button
              type="button"
              disabled={!selectedSvc}
              onClick={() => setStep(2)}
              className="w-full py-4 text-[10px] uppercase tracking-[0.28em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              {zh ? "下一步 — 選擇日期與時間 →" : "Next — Select Date & Time →"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Date & Time ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-8">
          <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-8">{zh ? "選擇日期與時間" : "Select Date & Time"}</p>

          <div>
            <label className={labelCls}>{zh ? "日期" : "Date"}</label>
            <input
              type="date"
              value={dateVal}
              onChange={e => { setDateVal(e.target.value); setTimeVal(""); }}
              min={todayStr()}
              className={`${inputCls} ${dateBlocked ? "border-red-300" : ""}`}
              required
            />
            {dateBlocked && (
              <p className="mt-2 text-[12px] text-red-400">
                {zh ? "此日期暫停預約，請選擇其他日期。" : "This date is unavailable. Please select another date."}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>{zh ? "時間" : "Time"}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {TIMES.map(t => {
                const svcDurMin  = selectedSvc ? parseDurationMin(selectedSvc.variant.duration) : 0;
                const tMin       = toMin(t);
                const isBooked   = bookedTimes.includes(t);
                const isTooLate  = svcDurMin > 0 && tMin + svcDurMin > CLOSING_MIN;
                const isDisabled = isBooked || isTooLate;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setTimeVal(t)}
                    className={`py-3.5 text-[10px] tracking-[0.08em] border transition-all duration-200 ${
                      isDisabled
                        ? "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through"
                        : timeVal === t
                        ? "border-[#C9A84C] bg-[#C9A84C] text-white"
                        : "border-neutral-200 text-neutral-500 hover:border-[#C9A84C] hover:text-[#C9A84C]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-4 text-[10px] uppercase tracking-[0.25em] border border-neutral-200 text-neutral-400 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-200"
            >
              {zh ? "← 返回" : "← Back"}
            </button>
            <button
              type="button"
              disabled={!dateVal || !timeVal || dateBlocked}
              onClick={() => setStep(3)}
              className="flex-[2] py-4 text-[10px] uppercase tracking-[0.25em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              {zh ? "下一步 — 確認資料 →" : "Next — Confirm Details →"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <form onSubmit={submit} className="space-y-6">
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-8">{zh ? "填寫您的資料" : "Your Details"}</p>

            <div>
              <label className={labelCls}>{zh ? "姓名" : "Full Name"}</label>
              <input type="text" value={info.name} onChange={setF("name")}
                placeholder={zh ? "您的姓名" : "Your name"} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>{zh ? "電話" : "Phone"}</label>
              <input type="tel" value={info.phone} onChange={setF("phone")}
                placeholder="(xxx) xxx-xxxx" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>{zh ? "電子郵件" : "Email"}</label>
              <input type="email" value={info.email} onChange={setF("email")}
                placeholder={zh ? "您的電子郵件" : "your@email.com"} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>{zh ? "備註（選填）" : "Notes (optional)"}</label>
              <textarea
                value={info.notes} onChange={setF("notes")} rows={3}
                placeholder={zh ? "過敏史、特殊需求或任何想告訴我們的事" : "Allergies, special requests, or anything we should know"}
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && <p className="text-[12px] text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 text-[10px] uppercase tracking-[0.25em] border border-neutral-200 text-neutral-400 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-200"
              >
                {zh ? "← 返回" : "← Back"}
              </button>
              <button
                type="submit"
                disabled={!info.name || !info.phone || !info.email || loading}
                className="flex-[2] py-4 text-[10px] uppercase tracking-[0.25em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading
                  ? <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />{zh ? "跳轉中..." : "Redirecting..."}</>
                  : (zh ? "繳付 $30 訂金 →" : "Pay $30 Deposit →")}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 text-center mt-3">
              {zh
                ? "將跳轉至 Square 安全付款頁面。訂金可抵扣服務費用，24 小時前取消可全額退款。"
                : "You'll be redirected to Square's secure checkout. Deposit applies to your total. Refundable with 24+ hours notice."}
            </p>
          </form>

          {/* Booking summary sidebar */}
          <div className="lg:pt-12">
            <div className="bg-[#F8F5EF] px-6 py-7">
              <p className="text-[9px] uppercase tracking-[0.45em] text-[#C9A84C] mb-5">{zh ? "預約摘要" : "Booking Summary"}</p>
              {selectedSvc && (
                <>
                  <p className="text-[1rem] font-light text-[#1C1C1C] leading-snug mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                    {zh ? selectedSvc.card.labelZh : selectedSvc.card.label}
                  </p>
                  <p className="text-[12px] text-neutral-400 mb-5">
                    {zh ? selectedSvc.variant.labelZh : selectedSvc.variant.label}
                  </p>
                  <div className="space-y-2.5 text-[12.5px] border-t border-neutral-200/70 pt-5">
                    <div className="flex justify-between"><span className="text-neutral-400">{zh ? "費用" : "Price"}</span><span className="text-[#C9A84C]">${selectedSvc.variant.price}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">{zh ? "時長" : "Duration"}</span><span className="text-neutral-500">{selectedSvc.variant.duration}</span></div>
                    {dateVal && <div className="flex justify-between"><span className="text-neutral-400">{zh ? "日期" : "Date"}</span><span className="text-neutral-500">{dateVal}</span></div>}
                    {timeVal && <div className="flex justify-between"><span className="text-neutral-400">{zh ? "時間" : "Time"}</span><span className="text-neutral-500">{timeVal}</span></div>}
                    <div className="flex justify-between border-t border-neutral-200/70 pt-2.5">
                      <span className="text-neutral-400">{zh ? "今日訂金" : "Deposit Due"}</span>
                      <span className="text-[#C9A84C] font-medium">
                        {(() => {
                          const p = selectedSvc.variant.price;
                          if (p <= 40)  return `$${p}`;
                          if (p <= 120) return "$30";
                          return "$40";
                        })()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-[9px] uppercase tracking-[0.45em] text-[#C9A84C]">{zh ? "訂金與取消政策" : "Deposit & Cancellation Policy"}</p>
              {(zh ? [
                "訂金將抵扣服務費用。",
                "提前至少 24 小時取消或改期，可獲全額退款。",
                "預約前 24 小時內取消或無故缺席，訂金不予退還。",
                "每次預約限改期一次，超過次數可能導致訂金沒收。",
                "完成預約即表示您同意本訂金及取消政策。",
              ] : [
                "Your deposit is applied toward your service total.",
                "Cancellations or rescheduling at least 24 hours before the appointment are eligible for a full refund.",
                "Deposits are non-refundable for cancellations within 24 hours or no-shows.",
                "Rescheduling is allowed once per booking. Additional changes may result in deposit forfeiture.",
                "By booking, you agree to our deposit and cancellation policy.",
              ]).map((line, i) => (
                <p key={i} className="text-[11.5px] text-neutral-400 leading-[1.75] pl-3 border-l border-neutral-200">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

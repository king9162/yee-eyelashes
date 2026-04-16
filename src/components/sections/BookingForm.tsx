"use client";

import { useState } from "react";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

const SERVICES = [
  { value: "classic-60",        labelEn: "Classic — 60pc New Set",              labelZh: "經典款 — 60根全新嫁接",          price: "$60",  duration: "50 min" },
  { value: "classic-natural",   labelEn: "Classic Natural — 80pc New Set",      labelZh: "經典自然款 — 80根全新嫁接",      price: "$80",  duration: "1 hr" },
  { value: "classic-signature", labelEn: "Classic Signature — 100pc New Set",   labelZh: "經典精選款 — 100根全新嫁接",     price: "$100", duration: "1.5 hrs" },
  { value: "classic-full",      labelEn: "Classic Full — 120pc New Set",        labelZh: "經典全套款 — 120根全新嫁接",     price: "$120", duration: "1.5 hrs" },
  { value: "hybrid",            labelEn: "Hybrid Set — New Set",                labelZh: "混合款 — 全新嫁接",              price: "$140", duration: "1.5 hrs" },
  { value: "volume",            labelEn: "Volume Set — New Set",                labelZh: "豐盈款 — 全新嫁接",              price: "$140", duration: "1.5 hrs" },
  { value: "design",            labelEn: "Design Set — New Set",                labelZh: "設計款 — 全新嫁接",              price: "$150", duration: "1.5 hrs" },
  { value: "refill-1wk",        labelEn: "1 Week Refill",                       labelZh: "一週補睫",                       price: "$40",  duration: "1 hr" },
  { value: "refill-2wk",        labelEn: "2 Week Refill",                       labelZh: "兩週補睫",                       price: "$50",  duration: "1 hr" },
  { value: "refill-3wk",        labelEn: "3 Week Refill",                       labelZh: "三週補睫",                       price: "$70",  duration: "1 hr" },
  { value: "lash-lift",         labelEn: "Lash Lift",                           labelZh: "睫毛燙翹",                       price: "$60",  duration: "1 hr" },
  { value: "lash-lift-tint",    labelEn: "Lash Lift + Tint",                    labelZh: "睫毛燙翹加染色",                 price: "$80",  duration: "1 hr" },
  { value: "tint",              labelEn: "Tint",                                labelZh: "睫毛染色",                       price: "$30",  duration: "30 min" },
  { value: "removal",           labelEn: "Eyelash Removal",                     labelZh: "睫毛卸除",                       price: "$20",  duration: "30 min" },
];

const TIMES = [
  "10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM",
];

const inputClass = "w-full bg-white border border-neutral-200 px-4 py-3.5 text-[13px] text-[#1C1C1C] tracking-[0.01em] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors duration-200";
const labelClass = "block text-[9.5px] uppercase tracking-[0.4em] text-neutral-400 mb-2";

// Get today's date as YYYY-MM-DD for min date
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingForm({ lang: _lang }: Props) {
  const lang = _lang;
  const zh   = lang === "zh";

  const [form, setForm] = useState({
    name: "", phone: "", email: "", service: "", date: "", time: "", notes: "",
  });
  const [step,      setStep]      = useState<1 | 2>(1);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  const selectedService = SERVICES.find(s => s.value === form.service);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const step1Valid = form.service && form.date && form.time;
  const step2Valid = form.name && form.phone && form.email;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!step1Valid || !step2Valid) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          serviceLabel: selectedService ? (zh ? selectedService.labelZh : selectedService.labelEn) : form.service,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      setError(zh ? "提交失敗，請稍後再試或直接致電我們。" : "Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-[680px] mx-auto px-6 sm:px-10 pt-16 pb-32 text-center">
        <div className="w-12 h-12 rounded-full border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-8">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C] mb-4">{zh ? "預約已提交" : "Request Received"}</p>
        <h2 className="text-[2rem] font-light text-[#1C1C1C] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
          {zh ? "感謝您的預約" : "Thank you, " + form.name}
        </h2>
        <p className="text-[13px] text-neutral-400 leading-[1.9] max-w-sm mx-auto mb-3">
          {zh
            ? "我們已收到您的預約請求，並已將確認信發送至您的電子郵件。我們將在 24 小時內與您確認。"
            : "We've received your request and sent a confirmation to your email. We'll confirm your appointment within 24 hours."}
        </p>
        <p className="text-[11px] text-neutral-300 tracking-wide">
          {zh ? "確認信已發送至 " : "Confirmation sent to "}<span className="text-[#C9A84C]">{form.email}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

        {/* ── Left: steps summary ──────────────────────────── */}
        <div>
          {/* Progress */}
          <div className="flex items-center gap-4 mb-12">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-4">
                <div className={`w-7 h-7 flex items-center justify-center text-[9px] tracking-[0.1em] border transition-all duration-300 ${
                  step === n
                    ? "border-[#C9A84C] text-[#C9A84C]"
                    : n < step
                    ? "border-[#C9A84C] bg-[#C9A84C] text-white"
                    : "border-neutral-200 text-neutral-300"
                }`}>
                  {n < step ? "✓" : `0${n}`}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.3em] ${step === n ? "text-[#1C1C1C]" : "text-neutral-300"}`}>
                  {n === 1
                    ? (zh ? "選擇服務" : "Choose Service")
                    : (zh ? "填寫資料" : "Your Details")}
                </span>
                {n < 2 && <div className="w-8 h-px bg-neutral-200" />}
              </div>
            ))}
          </div>

          {/* Selected service summary (step 2) */}
          {step === 2 && selectedService && (
            <div className="bg-[#F8F5EF] px-8 py-7 mb-10">
              <p className="text-[9.5px] uppercase tracking-[0.4em] text-[#C9A84C] mb-4">{zh ? "您的預約" : "Your Booking"}</p>
              <p className="text-[1.3rem] font-light text-[#1C1C1C] mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                {zh ? selectedService.labelZh : selectedService.labelEn}
              </p>
              <p className="text-[13px] text-neutral-400 mb-4">
                {form.date} · {form.time}
              </p>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-400">{zh ? "費用" : "Price"}</span>
                <span className="text-[#C9A84C]" style={{ fontFamily: "var(--font-serif)" }}>{selectedService.price}</span>
              </div>
              <div className="flex justify-between text-[13px] mt-1">
                <span className="text-neutral-400">{zh ? "時長" : "Duration"}</span>
                <span className="text-neutral-500">{selectedService.duration}</span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-5 text-[9.5px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-200"
              >
                {zh ? "← 修改" : "← Edit"}
              </button>
            </div>
          )}

          {/* Policy */}
          <div className={`${step === 2 ? "" : "mt-32"}`}>
            <p className="text-[9.5px] uppercase tracking-[0.4em] text-[#C9A84C] mb-3">{zh ? "取消政策" : "Cancellation Policy"}</p>
            <p className="text-[13px] text-neutral-400 leading-[1.85]">
              {zh
                ? "請提前至少 24 小時通知取消或更改預約。多次無故缺席或臨時取消者，未來預約可能需繳交訂金。"
                : "Please notify us at least 24 hours in advance for cancellations or changes. Repeated no-shows may require a deposit for future bookings."}
            </p>
          </div>
        </div>

        {/* ── Right: form ──────────────────────────────────── */}
        <form onSubmit={submit} className="space-y-0">

          {/* ── Step 1: Service + Date + Time ── */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-[9.5px] uppercase tracking-[0.45em] text-[#C9A84C] mb-8">
                {zh ? "選擇服務與時間" : "Select Service & Time"}
              </p>

              {/* Service */}
              <div>
                <label className={labelClass}>{zh ? "服務項目" : "Service"}</label>
                <select value={form.service} onChange={set("service")} className={inputClass} required>
                  <option value="">{zh ? "請選擇服務" : "Select a service"}</option>
                  <optgroup label={zh ? "── 全套嫁接" : "── Eyelash Extensions"}>
                    {SERVICES.slice(0, 7).map(s => (
                      <option key={s.value} value={s.value}>
                        {zh ? s.labelZh : s.labelEn} — {s.price}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={zh ? "── 補睫" : "── Refills"}>
                    {SERVICES.slice(7, 10).map(s => (
                      <option key={s.value} value={s.value}>
                        {zh ? s.labelZh : s.labelEn} — {s.price}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={zh ? "── 睫毛護理" : "── Lash Services"}>
                    {SERVICES.slice(10).map(s => (
                      <option key={s.value} value={s.value}>
                        {zh ? s.labelZh : s.labelEn} — {s.price}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className={labelClass}>{zh ? "日期" : "Date"}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  min={todayStr()}
                  className={inputClass}
                  required
                />
              </div>

              {/* Time grid */}
              <div>
                <label className={labelClass}>{zh ? "時間" : "Time"}</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, time: t }))}
                      className={`py-2.5 text-[10px] tracking-[0.1em] border transition-all duration-200 ${
                        form.time === t
                          ? "border-[#C9A84C] bg-[#C9A84C] text-white"
                          : "border-neutral-200 text-neutral-500 hover:border-[#C9A84C] hover:text-[#C9A84C]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="w-full mt-4 py-4 text-[10px] uppercase tracking-[0.25em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {zh ? "下一步 →" : "Continue →"}
              </button>
            </div>
          )}

          {/* ── Step 2: Personal info ── */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-[9.5px] uppercase tracking-[0.45em] text-[#C9A84C] mb-8">
                {zh ? "填寫您的資料" : "Your Details"}
              </p>

              <div>
                <label className={labelClass}>{zh ? "姓名" : "Full Name"}</label>
                <input type="text" value={form.name} onChange={set("name")} placeholder={zh ? "您的姓名" : "Your name"} className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>{zh ? "電話" : "Phone"}</label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="(xxx) xxx-xxxx" className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>{zh ? "電子郵件" : "Email"}</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder={zh ? "您的電子郵件" : "your@email.com"} className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>{zh ? "備註（選填）" : "Notes (optional)"}</label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder={zh ? "過敏史、特殊需求或任何想告訴我們的事" : "Allergies, special requests, or anything we should know"}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && (
                <p className="text-[12px] text-red-400 tracking-wide">{error}</p>
              )}

              <button
                type="submit"
                disabled={!step2Valid || loading}
                className="w-full py-4 text-[10px] uppercase tracking-[0.25em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading
                  ? <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />{zh ? "提交中..." : "Submitting..."}</>
                  : (zh ? "確認預約" : "Confirm Booking")}
              </button>

              <p className="text-[11px] text-neutral-300 text-center tracking-wide">
                {zh ? "提交後我們將在 24 小時內確認您的預約" : "We'll confirm your appointment within 24 hours"}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

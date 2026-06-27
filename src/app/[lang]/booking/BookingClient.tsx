"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookingCategories, type BookingItem, type PcsOption } from "@/data/booking-services";

type Phase = "service" | "service-detail" | "datetime" | "info";

interface Selection {
  categoryId:   string;
  item:         BookingItem;
  pcs:          PcsOption | null;
  serviceLabel: string;
  serviceKey:   string;
  price:        number;
}

const ALL_TIMES = [
  "9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM",
];
const MONTH_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_ZH = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const DAY_EN   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_ZH   = ["日","一","二","三","四","五","六"];

function catName(cat: { name: string; nameZh: string }, zh: boolean) { return zh ? cat.nameZh : cat.name; }
function itemName(item: { name: string; nameZh: string }, zh: boolean) { return zh ? item.nameZh : item.name; }

function parseDurMin(dur: string): number {
  let t = 0;
  const h = dur.match(/(\d+)\s*hr/);
  const m = dur.match(/(\d+)\s*min/);
  if (h) t += parseInt(h[1]) * 60;
  if (m) t += parseInt(m[1]);
  return t || 60;
}
function fmtDur(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export default function BookingClient() {
  const params  = useParams();
  const router  = useRouter();
  const lang    = (params.lang as string) ?? "en";
  const zh      = lang === "zh";

  const [phase,        setPhase]        = useState<Phase>("service");
  const [activeCat,    setActiveCat]    = useState(bookingCategories[0].id);
  const [selections,   setSelections]   = useState<Selection[]>([]);
  const [barExpanded,  setBarExpanded]  = useState(false);
  const [detailItem,   setDetailItem]   = useState<{ catId: string; item: BookingItem } | null>(null);
  const [pendingPcs,   setPendingPcs]   = useState<PcsOption | null>(null);
  const [pendingStaff, setPendingStaff] = useState<string>("any");
  const [detailErrors, setDetailErrors] = useState<{ pcs?: boolean }>({});

  const [date,         setDate]         = useState("");
  const [time,         setTime]         = useState("");
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [bookedTimes,  setBookedTimes]  = useState<Set<string>>(new Set());
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [calYear,      setCalYear]      = useState(new Date().getFullYear());
  const [calMonth,     setCalMonth]     = useState(new Date().getMonth());

  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [email,      setEmail]      = useState("");
  const [notes,      setNotes]      = useState("");
  const [website,    setWebsite]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState("");

  // Browser back intercept on detail page
  useEffect(() => {
    if (phase === "service-detail") {
      window.history.pushState({ phase: "service-detail" }, "");
      const handlePop = () => { setPhase("service"); setPendingPcs(null); setDetailErrors({}); };
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [phase]);

  useEffect(() => {
    fetch("/api/blocked-dates")
      .then(r => r.json())
      .then(d => setBlockedDates(new Set((d.blockedDates ?? []).map((b: { date: string }) => b.date))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!date) return;
    setLoadingTimes(true);
    setBookedTimes(new Set());
    fetch(`/api/bookings/slots?date=${date}`)
      .then(r => r.json())
      .then(d => setBookedTimes(new Set(d.bookedTimes ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTimes(false));
  }, [date]);

  function openDetail(catId: string, item: BookingItem) {
    setDetailItem({ catId, item });
    setPendingPcs(null);
    setPendingStaff("any");
    setDetailErrors({});
    setPhase("service-detail");
  }

  function toggleFlat(catId: string, item: BookingItem) {
    setSelections(prev => {
      const idx = prev.findIndex(s => s.serviceKey === item.id);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { categoryId: catId, item, pcs: null, serviceLabel: item.name, serviceKey: item.id, price: item.flatPrice! }];
    });
  }

  function addPcs() {
    if (!pendingPcs) { setDetailErrors({ pcs: true }); return; }
    setDetailErrors({});
    if (!detailItem) return;
    const { catId, item } = detailItem;
    const serviceKey = `${item.id}-${pendingPcs.label.toLowerCase().replace(/\s+/g, "-")}`;
    setSelections(prev => {
      const idx = prev.findIndex(s => s.serviceKey === serviceKey);
      const entry: Selection = {
        categoryId: catId, item, pcs: pendingPcs,
        serviceLabel: pendingPcs.label === item.name ? item.name : `${pendingPcs.label} — ${item.name}`,
        serviceKey, price: pendingPcs.price,
      };
      if (idx >= 0) { const u = [...prev]; u[idx] = entry; return u; }
      return [...prev, entry];
    });
    setPhase("service");
  }

  function removeSelection(key: string) {
    setSelections(prev => prev.filter(s => s.serviceKey !== key));
  }

  const totalPrice       = selections.reduce((sum, s) => sum + s.price, 0);
  const totalDurationMin = selections.reduce((sum, s) => sum + parseDurMin((s.pcs?.duration ?? s.item.duration)), 0);
  const hasSelections    = selections.length > 0;

  function ds(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  function isDisabled(d: string) {
    const today = new Date().toISOString().split("T")[0];
    if (d <= today) return true;
    if (new Date(d + "T12:00:00").getDay() === 0) return true;
    if (blockedDates.has(d)) return true;
    return false;
  }

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells    = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSelections || !date || !time) return;
    setSubmitting(true);
    setFormError("");
    const serviceLabel = selections.map(s => s.serviceLabel).join(", ");
    const primaryItem  = selections[0];
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, email, notes, website,
          service: primaryItem.categoryId,
          serviceKey: primaryItem.serviceKey,
          serviceLabel,
          date, time,
          duration: primaryItem.item.duration,
          lang,
        }),
      });
      if (res.ok) {
        router.push(`/${lang}/booking/success`);
      } else {
        const d = await res.json();
        setFormError(d.error ?? (zh ? "提交失敗，請重試" : "Submission failed"));
      }
    } catch {
      setFormError(zh ? "網路錯誤，請重試" : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Bottom bar (sticky, shown when services selected) ─────────────
  function BottomBar({ showNext = false }: { showNext?: boolean }) {
    if (!hasSelections) return null;
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {barExpanded && (
          <div className="border-b border-gray-100">
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
              {selections.map(s => (
                <div key={s.serviceKey} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-[6px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-black leading-snug">{s.serviceLabel}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {s.pcs?.duration ?? s.item.duration} · US${s.price}.00
                    </p>
                  </div>
                  <button onClick={() => removeSelection(s.serviceKey)}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                    {zh ? "移除" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-black">
              {selections.length} {zh ? (selections.length > 1 ? "個服務" : "個服務") : (selections.length > 1 ? "services" : "service")}
            </p>
            <p className="text-[12px] text-gray-500">US${totalPrice}.00 · {fmtDur(totalDurationMin)}</p>
          </div>
          <button onClick={() => setBarExpanded(p => !p)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              {barExpanded
                ? <path d="M19 15l-7-7-7 7"/>
                : <path d="M5 9l7 7 7-7"/>}
            </svg>
          </button>
          {showNext && (
            <button
              onClick={() => { setDate(""); setTime(""); setPhase("datetime"); setBarExpanded(false); }}
              className="px-7 py-2.5 bg-[#3d5166] text-white text-[14px] font-semibold rounded-lg hover:opacity-90 transition-all shrink-0">
              {zh ? "下一步" : "Next"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Inline selections summary (for datetime/info phases) ──────────
  function InlineSummary() {
    if (!hasSelections) return null;
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
        {selections.map(s => (
          <div key={s.serviceKey} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-[7px] shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-black leading-snug">{s.serviceLabel}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">US${s.price}.00 · {s.pcs?.duration ?? s.item.duration}</p>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[13px] text-gray-500">{zh ? "總計" : "Total"}</p>
          <p className="text-[14px] font-bold text-black">US${totalPrice}.00</p>
        </div>
        {date && (
          <div className="pt-2 border-t border-gray-100 text-[13px] text-gray-500 space-y-0.5">
            <p>{date}{time ? ` · ${time}` : ""}</p>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // Phase 1: Service selection
  // ══════════════════════════════════════════════════════════════
  if (phase === "service") {
    return (
      <div className="booking-panel min-h-screen bg-white pt-[70px] pb-[90px]">
        <div className="border-b border-gray-200 sticky top-[70px] bg-white z-40">
          <div className="max-w-2xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {bookingCategories.map(c => (
                <button key={c.id}
                  onClick={() => {
                    setActiveCat(c.id);
                    document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-4 py-3.5 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors
                    ${activeCat === c.id
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {catName(c, zh)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {bookingCategories.map(c => (
            <div key={c.id} id={`cat-${c.id}`} className="mb-10">
              <h2 className="text-[20px] font-bold text-black mb-3">{catName(c, zh)}</h2>
              <div className="divide-y divide-gray-200">
                {c.items.map(item => {
                  const isAdded = selections.some(s => s.item.id === item.id);
                  return (
                    <button key={item.id}
                      onClick={() => item.flatPrice !== null ? toggleFlat(c.id, item) : openDetail(c.id, item)}
                      className={`w-full text-left py-4 flex items-center justify-between transition-colors
                        ${isAdded ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                      <div>
                        <p className="text-[15px] font-bold text-black leading-snug">
                          {itemName(item, zh)}
                        </p>
                        <p className="text-[13px] text-gray-500 mt-0.5">
                          {item.flatPrice !== null ? `US$${item.flatPrice}.00` : (zh ? "依規格定價" : "Price varies")}
                          {" · "}{item.duration}+
                        </p>
                      </div>
                      {isAdded ? (
                        <span className="ml-4 shrink-0 text-[12px] text-gray-500 flex items-center gap-1">
                          ✓ {zh ? "已加入" : "Added"}
                        </span>
                      ) : (
                        <svg className="ml-4 shrink-0 text-gray-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <BottomBar showNext />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // Phase 1b: Service detail
  // ══════════════════════════════════════════════════════════════
  if (phase === "service-detail" && detailItem) {
    const { catId, item } = detailItem;
    const alreadyAdded = pendingPcs
      ? selections.some(s => s.serviceKey === `${item.id}-${pendingPcs.label.toLowerCase().replace(/\s+/g, "-")}`)
      : false;

    return (
      <div className="booking-panel min-h-screen bg-white pt-[70px] pb-[90px]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <p className="text-[13px] text-gray-400 mb-5">
            <button onClick={() => { setPhase("service"); setPendingPcs(null); }}
              className="hover:text-gray-700 transition-colors">
              {zh ? "所有服務" : "All services"}
            </button>
            {" / "}
            <span className="text-black font-semibold">{itemName(item, zh)}</span>
          </p>

          <h1 className="text-[32px] font-black text-black mb-1 tracking-tight">{itemName(item, zh)}</h1>
          <p className="text-[14px] text-gray-500 mb-8">
            {zh ? "依規格定價" : "Price varies"} · {item.duration}+
          </p>

          <h3 className="text-[20px] font-bold text-black mb-3">{zh ? "選擇規格" : "Options"}</h3>
          {detailErrors.pcs && (
            <p className="text-[13px] text-red-500 flex items-center gap-1.5 mb-2">
              <span className="text-[15px]">⊘</span> {zh ? "請選擇規格" : "Please select an option."}
            </p>
          )}
          <div className="divide-y divide-gray-200 mb-10">
            {item.pcsOptions!.map(opt => {
              const active   = pendingPcs?.label === opt.label;
              const optKey   = `${item.id}-${opt.label.toLowerCase().replace(/\s+/g, "-")}`;
              const inCart   = selections.some(s => s.serviceKey === optKey);
              return (
                <label key={opt.label}
                  className={`flex items-center justify-between py-4 cursor-pointer transition-colors rounded-lg px-3 -mx-3 ${active ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  onClick={() => { setPendingPcs(opt); setDetailErrors({}); }}>
                  <div>
                    <p className="text-[16px] font-bold text-black">{opt.label}</p>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {opt.price === 0 ? (zh ? "請來電詢價" : "Contact us") : `US$${opt.price}.00`} · {opt.duration ?? item.duration}
                      {inCart && <span className="ml-2 text-[11px] text-gray-400">✓ {zh ? "已加入" : "Added"}</span>}
                    </p>
                  </div>
                  <input type="radio" name="pcs" value={opt.label} checked={active}
                    onChange={() => {}} className="w-5 h-5 accent-black cursor-pointer ml-4 shrink-0" />
                </label>
              );
            })}
          </div>

          <h3 className="text-[20px] font-bold text-black mb-3">{zh ? "選擇技師" : "Staff"}</h3>
          <div className="divide-y divide-gray-200 mb-10">
            {[
              { id: "any", label: zh ? "任何技師" : "Any staff", avatar: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ), bg: "bg-gray-100 text-gray-500" },
              { id: "staff1", label: "Staff 1", avatar: <span className="font-bold text-[13px]">St</span>, bg: "bg-gray-200 text-gray-600" },
              { id: "staff2", label: "Staff 2", avatar: <span className="font-bold text-[13px]">St</span>, bg: "bg-gray-200 text-gray-600" },
            ].map(s => {
              const active = pendingStaff === s.id;
              return (
                <label key={s.id}
                  className={`flex items-center gap-4 py-4 cursor-pointer transition-colors rounded-lg px-3 -mx-3 ${active ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  onClick={() => setPendingStaff(s.id)}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
                    {s.avatar}
                  </div>
                  <p className="flex-1 text-[16px] font-bold text-black">{s.label}</p>
                  <input type="radio" name="staff" checked={active}
                    onChange={() => {}} className="w-5 h-5 accent-black cursor-pointer shrink-0" />
                </label>
              );
            })}
          </div>

          <button onClick={addPcs}
            className="w-full py-4 text-[15px] font-bold bg-[#3d5166] text-white rounded-xl hover:opacity-90 transition-all">
            {alreadyAdded ? (zh ? "更新" : "Update") : (zh ? "加入預約" : "Add")}
          </button>
        </div>

        {hasSelections && <BottomBar />}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // Phase 2: Date + Time
  // ══════════════════════════════════════════════════════════════
  if (phase === "datetime") {
    return (
      <div className="booking-panel min-h-screen bg-white pt-[70px]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button onClick={() => setPhase("service")}
            className="text-[13px] text-gray-400 hover:text-black transition-colors mb-5 flex items-center gap-1">
            ← {zh ? "所有服務" : "All services"}
          </button>

          <InlineSummary />

          <h2 className="text-[20px] font-bold text-black mb-1">{zh ? "選擇日期" : "Select a date"}</h2>
          <p className="text-[14px] text-gray-500 mb-6">{zh ? "週日公休" : "Closed on Sundays"}</p>

          <div className="border border-gray-200 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-xl text-gray-400 hover:text-black transition-colors">‹</button>
              <p className="text-[15px] font-semibold text-black">
                {zh ? MONTH_ZH[calMonth] : MONTH_EN[calMonth]} {calYear}
              </p>
              <button onClick={() => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-xl text-gray-400 hover:text-black transition-colors">›</button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {(zh ? DAY_ZH : DAY_EN).map((d, i) => (
                <div key={d} className={`text-center text-[12px] py-1 font-medium ${i === 0 ? "text-gray-300" : "text-gray-500"}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calCells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const d = ds(calYear, calMonth, day);
                const disabled = isDisabled(d);
                const selected = d === date;
                return (
                  <button key={d} disabled={disabled}
                    onClick={() => { setDate(d); setTime(""); }}
                    className={`h-10 w-full text-[14px] rounded-full transition-all font-medium
                      ${selected ? "bg-black text-white" : ""}
                      ${!selected && !disabled ? "hover:bg-gray-100 text-black" : ""}
                      ${disabled ? "text-gray-200 cursor-not-allowed" : ""}`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {date && (
            <>
              <h2 className="text-[20px] font-bold text-black mb-4">{zh ? "選擇時間" : "Select a time"}</h2>
              {loadingTimes ? (
                <p className="text-[14px] text-gray-400">{zh ? "載入中…" : "Loading…"}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ALL_TIMES.map(t => {
                    const unavail = bookedTimes.has(t);
                    const active  = t === time;
                    return (
                      <button key={t} disabled={unavail}
                        onClick={() => setTime(t)}
                        className={`py-3 text-[14px] font-medium border rounded-lg transition-all
                          ${active ? "bg-black text-white border-black" : ""}
                          ${!active && !unavail ? "bg-white border-gray-200 hover:border-black text-black" : ""}
                          ${unavail ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" : ""}`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
              {time && (
                <button onClick={() => setPhase("info")}
                  className="mt-6 w-full py-4 bg-black text-white text-[15px] font-medium rounded-lg hover:opacity-90 transition-all">
                  {zh ? "下一步" : "Next"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // Phase 3: Info
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="booking-panel min-h-screen bg-white pt-[70px]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => setPhase("datetime")}
          className="text-[13px] text-gray-400 hover:text-black transition-colors mb-5 flex items-center gap-1">
          ← {zh ? "選擇日期" : "Select date"}
        </button>

        <InlineSummary />

        <h2 className="text-[20px] font-bold text-black mb-6">{zh ? "填寫資料" : "Your information"}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" name="website" value={website}
            onChange={e => setWebsite(e.target.value)}
            style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

          {[
            { label: zh ? "姓名" : "Full name", value: name,  set: setName,  type: "text",  req: true },
            { label: zh ? "電話" : "Phone",      value: phone, set: setPhone, type: "tel",   req: true },
            { label: zh ? "電子郵件" : "Email",  value: email, set: setEmail, type: "email", req: true },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[14px] font-medium text-black mb-2">{f.label}</label>
              <input required={f.req} type={f.type} value={f.value}
                onChange={e => f.set(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
            </div>
          ))}

          <div>
            <label className="block text-[14px] font-medium text-black mb-2">
              {zh ? "備註（選填）" : "Notes (optional)"}
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder={zh ? "如有特殊需求請說明" : "Any special requests?"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none" />
          </div>

          {formError && <p className="text-[14px] text-red-500">{formError}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-black text-white text-[15px] font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-40">
            {submitting ? (zh ? "提交中…" : "Submitting…") : (zh ? "確認預約" : "Book appointment")}
          </button>

          <p className="text-[13px] text-gray-400 text-center leading-relaxed">
            {zh
              ? "確認信將寄至您的電子信箱。兩週後系統會發送補睫提醒。"
              : "A confirmation email will be sent to you. A refill reminder will be sent in 14 days."}
          </p>
        </form>
      </div>
    </div>
  );
}

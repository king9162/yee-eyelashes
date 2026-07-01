"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line,
} from "recharts";

type Booking = { id: string; date: string; status: string; service_label: string; phone: string; email: string };
type Client  = { id: string; visit_date: string; phone: string; email: string; owner: string; deleted?: boolean };

const GOLD = "#C9A84C";
const DARK = "#1C1C1C";
const MUTED = "#D4C5A9";

// ── helpers ──────────────────────────────────────────────────────────────────
const normP = (p: string) => (p ?? "").replace(/\D/g, "").slice(-10);

function monthKey(dateStr: string) {
  if (!dateStr) return "";
  const [y, m] = dateStr.split("-");
  return `${y}-${m}`;
}
function monthLabel(key: string) {
  if (!key) return "";
  const [, m] = key.split("-");
  return `${parseInt(m)}/1`;
}

function pct(a: number, b: number) {
  if (b === 0) return null;
  return Math.round(((a - b) / b) * 100);
}

function DeltaBadge({ cur, prev }: { cur: number; prev: number }) {
  const d = pct(cur, prev);
  if (d === null) return null;
  const up = d >= 0;
  return (
    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
      {up ? "↑" : "↓"} {Math.abs(d)}%
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function AnalyticsView({ adminKey }: { adminKey: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients,  setClients]  = useState<Client[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const h = { Authorization: `Bearer ${adminKey}` };
    Promise.all([
      fetch("/api/bookings", { headers: h }).then(r => r.json()).catch(() => []),
      fetch("/api/clients",  { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([b, c]) => {
      if (Array.isArray(b)) setBookings(b);
      if (Array.isArray(c)) setClients(c);
      setLoading(false);
    });

    const poll = setInterval(async () => {
      const [b, c] = await Promise.all([
        fetch("/api/bookings", { headers: h }).then(r => r.json()).catch(() => null),
        fetch("/api/clients",  { headers: h }).then(r => r.json()).catch(() => null),
      ]);
      if (Array.isArray(b)) setBookings(b);
      if (Array.isArray(c)) setClients(c);
    }, 30000);
    return () => clearInterval(poll);
  }, [adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── current calendar year: Jan/1 → current month ────────────────────────
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const curYear = today.getFullYear();
  const curMonth = today.getMonth(); // 0-based
  const months: string[] = [];
  for (let m = 0; m <= curMonth; m++) {
    months.push(`${curYear}-${String(m + 1).padStart(2, "0")}`);
  }
  const curMk  = months[months.length - 1];
  const prevMk = months.length >= 2 ? months[months.length - 2] : months[0];
  const [curYrStr, curMoStr] = curMk.split("-");
  const curMonthEnd = `${curYrStr}-${curMoStr}-${new Date(parseInt(curYrStr), parseInt(curMoStr), 0).getDate().toString().padStart(2, "0")}`;

  // For each month, the end date is the last day of that month
  function mkEnd(mk: string) {
    return mk === curMk ? curMonthEnd : `${mk}-31`;
  }

  // bookings per month — same logic as Dashboard
  const confirmedByMonth: Record<string, number> = {};
  const cancelledByMonth: Record<string, number> = {};

  // Build confirmed/any booking sets (mirrors Dashboard)
  const confirmedSet  = new Set<string>(); // "key|date"
  const anyBookingSet = new Set<string>();
  for (const b of bookings) {
    const bk = normP(b.phone) || b.email;
    if (bk && b.date) {
      anyBookingSet.add(`${bk}|${b.date}`);
      if (b.status !== "cancelled") confirmedSet.add(`${bk}|${b.date}`);
    }
  }

  for (const b of bookings) {
    const mk = monthKey(b.date);
    if (!months.includes(mk)) continue;
    if (b.date > mkEnd(mk)) continue;
    if (b.status === "cancelled") {
      cancelledByMonth[mk] = (cancelledByMonth[mk] ?? 0) + 1;
    } else {
      confirmedByMonth[mk] = (confirmedByMonth[mk] ?? 0) + 1;
    }
  }

  // new vs returning — exact same logic as Dashboard
  const mainClients = clients.filter(c => c.owner !== "elly" && !c.deleted);
  const visitDatesMap = new Map<string, Set<string>>();
  const firstVisitMap = new Map<string, string>();
  for (const c of mainClients) {
    const k = normP(c.phone ?? "") || c.email || c.id;
    if (!visitDatesMap.has(k)) visitDatesMap.set(k, new Set());
    if (c.visit_date) {
      const hasBooking   = anyBookingSet.has(`${k}|${c.visit_date}`);
      const hasConfirmed = confirmedSet.has(`${k}|${c.visit_date}`);
      if (!hasBooking || hasConfirmed) {
        visitDatesMap.get(k)!.add(c.visit_date);
        const prev = firstVisitMap.get(k);
        if (!prev || c.visit_date < prev) firstVisitMap.set(k, c.visit_date);
      }
    }
  }

  // new vs returning — mirrors Dashboard exactly (size > 1 + visit in month)
  const newByMonth:       Record<string, number> = {};
  const returningByMonth: Record<string, number> = {};

  for (const mk of months) {
    const mStart = `${mk}-01`;
    const mEnd   = mk === curMk ? curMonthEnd : `${mk}-31`;
    returningByMonth[mk] = [...visitDatesMap.values()].filter(s =>
      s.size > 1 && [...s].some(d => d >= mStart && d <= mEnd)
    ).length;
    newByMonth[mk] = [...firstVisitMap.values()].filter(d => d >= mStart && d <= mEnd).length;
  }

  // ── Retention Rate — all-time: returning clients / total unique clients ───
  const allTimeReturning = [...visitDatesMap.values()].filter(s => s.size > 1).length;
  const allTimeClients   = visitDatesMap.size;
  const allTimeRetention = allTimeClients > 0 ? Math.round((allTimeReturning / allTimeClients) * 100) : null;

  // ── Avg Return Gap (all-time: days between consecutive visits per client) ──
  const avgReturnGap = (() => {
    const gaps: number[] = [];
    for (const [, dates] of visitDatesMap) {
      const sorted = [...dates].sort();
      for (let i = 1; i < sorted.length; i++) {
        const diff = Math.round(
          (new Date(sorted[i] + "T12:00:00").getTime() - new Date(sorted[i - 1] + "T12:00:00").getTime()) / 86400000
        );
        if (diff > 0 && diff < 180) gaps.push(diff);
      }
    }
    if (gaps.length === 0) return null;
    return Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  })();

  // ── Busiest Day of Week (calendar year confirmed bookings) ─────────────────
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bookingsByDow = [0, 0, 0, 0, 0, 0, 0];
  for (const b of bookings) {
    if (b.status === "cancelled" || !b.date) continue;
    const mk = monthKey(b.date);
    if (!months.includes(mk)) continue;
    if (b.date > mkEnd(mk)) continue;
    bookingsByDow[new Date(b.date + "T12:00:00").getDay()]++;
  }
  const dowChartData = DOW.map((day, i) => ({ day, Bookings: bookingsByDow[i] }));

  // build chart data
  const chartData = months.map(mk => ({
    month:        monthLabel(mk),
    Reservations: confirmedByMonth[mk] ?? 0,
    Cancelled:    cancelledByMonth[mk] ?? 0,
    New:          newByMonth[mk] ?? 0,
    Returning:    returningByMonth[mk] ?? 0,
  }));

  const confCur  = confirmedByMonth[curMk]  ?? 0;
  const confPrev = confirmedByMonth[prevMk] ?? 0;
  const cancCur  = cancelledByMonth[curMk]  ?? 0;
  const cancPrev = cancelledByMonth[prevMk] ?? 0;
  const newCur   = newByMonth[curMk]        ?? 0;
  const newPrev  = newByMonth[prevMk]       ?? 0;
  const growthD  = pct(confCur, confPrev);

  const todayDay = today.getDate();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-3 py-2 text-[12px]">
        <p className="font-bold text-[#1C1C1C] mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF8] p-4 md:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-bold text-[#1C1C1C]">Report</h1>
        <p className="text-[12px] text-neutral-400 mt-0.5">{curYear} · My Clients</p>
      </div>

      {/* Stat cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* Reservations + Growth merged */}
        <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 shadow-sm">
          <p className="text-[11px] text-neutral-400 font-medium">Reservations</p>
          <div className="flex items-end justify-between mt-0.5">
            <p className="text-[24px] font-bold text-[#1C1C1C]">{confCur}</p>
            <p className={`text-[18px] font-bold pb-0.5 ${growthD === null ? "text-neutral-300" : growthD >= 0 ? "text-green-600" : "text-red-500"}`}>
              {growthD === null ? "—" : `${growthD >= 0 ? "+" : ""}${growthD}%`}
            </p>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">vs last month ({confPrev})</p>
        </div>

        {/* New Clients */}
        <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 shadow-sm">
          <p className="text-[11px] text-neutral-400 font-medium">New Clients</p>
          <div className="flex items-end justify-between mt-0.5">
            <p className="text-[24px] font-bold text-[#1C1C1C]">{newCur}</p>
            <DeltaBadge cur={newCur} prev={newPrev} />
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">vs last month ({newPrev})</p>
        </div>

        {/* Retention Rate */}
        <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 shadow-sm">
          <p className="text-[11px] text-neutral-400 font-medium">Retention Rate</p>
          <p className="text-[24px] font-bold mt-0.5" style={{ color: GOLD }}>
            {allTimeRetention === null ? "—" : `${allTimeRetention}%`}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">
            {allTimeReturning} returning · {allTimeClients} total
          </p>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 shadow-sm">
          <p className="text-[11px] text-neutral-400 font-medium">Cancelled</p>
          <p className="text-[24px] font-bold text-[#1C1C1C] mt-0.5">{cancCur}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-neutral-400">vs last month ({cancPrev})</span>
            <DeltaBadge cur={cancCur} prev={cancPrev} />
          </div>
        </div>

      </div>

      {/* Bookings bar chart */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
        <h2 className="text-[13px] font-bold text-[#1C1C1C] mb-4">Monthly Bookings</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="Reservations" fill={DARK}  radius={[4,4,0,0]} />
            <Bar dataKey="Cancelled"    fill={MUTED} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* New Clients */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
        <h2 className="text-[13px] font-bold text-[#1C1C1C] mb-4">New Clients</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="New" fill={GOLD} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Booking Trend line */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
        <h2 className="text-[13px] font-bold text-[#1C1C1C] mb-4">Booking Trend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Reservations" stroke={DARK} strokeWidth={2} dot={{ r: 3, fill: DARK }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="New"          stroke={GOLD} strokeWidth={2} dot={{ r: 3, fill: GOLD }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Busiest Day of Week */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
        <h2 className="text-[13px] font-bold text-[#1C1C1C] mb-1">Busiest Day</h2>
        <p className="text-[11px] text-neutral-400 mb-4">Confirmed bookings by day of week · {curYear}</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dowChartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Bookings" fill={GOLD} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month-over-month table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <h2 className="text-[13px] font-bold text-[#1C1C1C]">Month-over-Month</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#FAFAF8]">
                <th className="px-4 py-2 text-left text-[11px] text-neutral-400 font-medium">Month</th>
                <th className="px-3 py-2 text-center text-[11px] text-neutral-400 font-medium">Reservations</th>
                <th className="px-3 py-2 text-center text-[11px] text-neutral-400 font-medium">Cancelled</th>
                <th className="px-3 py-2 text-center text-[11px] text-neutral-400 font-medium">New</th>
                <th className="px-3 py-2 text-center text-[11px] text-neutral-400 font-medium">Retention</th>
                <th className="px-3 py-2 text-center text-[11px] text-neutral-400 font-medium">Cancel %</th>
              </tr>
            </thead>
            <tbody>
              {[...months].reverse().map((mk, i) => {
                const isCurrent = mk === curMk;
                const conf = confirmedByMonth[mk] ?? 0;
                const canc = cancelledByMonth[mk] ?? 0;
                const nw   = newByMonth[mk]       ?? 0;
                const ret  = returningByMonth[mk] ?? 0;
                const cr   = conf + canc > 0 ? Math.round((canc / (conf + canc)) * 100) : 0;
                const rr   = ret + nw > 0 ? Math.round((ret / (ret + nw)) * 100) : null;
                const prevMkLocal = months[months.length - 2 - i];
                const prevConfSamePeriod = prevMkLocal ? bookings.filter(b => {
                  if (b.status === "cancelled") return false;
                  if (!b.date.startsWith(prevMkLocal)) return false;
                  return true;
                }).length : null;
                return (
                  <tr key={mk} className={`border-t border-neutral-50 ${isCurrent ? "bg-[#FAFAF8] font-semibold" : "hover:bg-[#FAFAF8]"}`}>
                    <td className="px-4 py-2.5 text-[#1C1C1C]">{monthLabel(mk)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{conf}</span>
                        {prevConfSamePeriod !== null && <DeltaBadge cur={conf} prev={prevConfSamePeriod} />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-neutral-500">{canc}</td>
                    <td className="px-3 py-2.5 text-center" style={{ color: GOLD }}>{nw}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span style={{ color: rr !== null && rr >= 50 ? GOLD : undefined }} className={rr === null ? "text-neutral-300" : ""}>
                        {rr !== null ? `${rr}%` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={cr > 20 ? "text-red-500 font-semibold" : "text-neutral-400"}>{cr > 0 ? `${cr}%` : "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

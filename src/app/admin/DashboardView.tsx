"use client";
import { useState, useEffect } from "react";

type Weather = {
  temp: number;
  code: number;
  rainChance: number;
};

function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}

function weatherDesc(code: number): string {
  if (code === 0) return "Clear skies";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Light drizzle";
  if (code <= 65) return "Rainy";
  if (code <= 75) return "Snowing";
  if (code <= 82) return "Rain showers";
  return "Thunderstorms";
}

type DashBooking = {
  id: string; date: string; status: string; name: string;
  service_label: string; time: string; phone: string; email: string;
  duration_min?: number; notes?: string;
};
type DashClient  = { id: string; visit_date: string; phone: string; email: string; owner: string; notes: string; first_name: string; last_name: string; birthday?: string; deleted?: boolean };
type DashReview  = { id: string; rating: number; deleted_from_google?: boolean };

function parseTimeMin(t: string): number {
  const [hm, period] = (t ?? "").split(" ");
  let [h, m] = (hm ?? "").split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return (h || 0) * 60 + (m || 0);
}

function addMinutes(t: string, mins: number): string {
  const total = parseTimeMin(t) + mins;
  const h24 = total % (24 * 60);
  let h = Math.floor(h24 / 60);
  const m = h24 % 60;
  const period = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

function fmtTimeRange(time: string, duration?: number): string {
  if (!time) return "";
  if (!duration) return time;
  return `${time} – ${addMinutes(time, duration)}`;
}

const APPT_TIMES = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

const EMPTY_ADD  = { name:"", phone:"", email:"", service_label:"", date:"", time:"10:00 AM", duration_min:90 };
const EMPTY_EDIT = { ...EMPTY_ADD, notes:"" };

export default function DashboardView({ adminKey, letterOpenedAt, adminLoginLog, clientCount, onClearLoginLog }: {
  adminKey: string;
  letterOpenedAt?: string | null;
  adminLoginLog?: { at: string; ip: string; device: string }[];
  clientCount?: number;
  onClearLoginLog?: () => void;
}) {
  const [bookings,    setBookings]    = useState<DashBooking[]>([]);
  const [clients,     setClients]     = useState<DashClient[]>([]);
  const [reviews,     setReviews]     = useState<DashReview[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [weather,     setWeather]     = useState<Weather | null>(null);
  const [showPopup,   setShowPopup]   = useState(false);
  const [cancelling,  setCancelling]  = useState<string | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [addForm,     setAddForm]     = useState(EMPTY_ADD);
  const [addSaving,   setAddSaving]   = useState(false);
  const [addError,    setAddError]    = useState("");
  const [showEdit,    setShowEdit]    = useState<DashBooking | null>(null);
  const [editForm,    setEditForm]    = useState<typeof EMPTY_ADD & { notes: string }>(EMPTY_EDIT);
  const [editSaving,  setEditSaving]  = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [memberStats, setMemberStats] = useState<{
    total_members: number;
    active_coupons: number;
    pending_referrals: number;
    completed_referrals: number;
  } | null>(null);

  const h = { Authorization: `Bearer ${adminKey}` };

  async function reload() {
    const [b, c] = await Promise.all([
      fetch("/api/bookings", { headers: h }).then(r => r.json()),
      fetch("/api/clients",  { headers: h }).then(r => r.json()),
    ]);
    setBookings(Array.isArray(b) ? b : []);
    setClients(Array.isArray(c) ? c : []);
  }

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const key = `betty-popup-${today}`;
    if (!localStorage.getItem(key)) setShowPopup(true);

    fetch("https://api.open-meteo.com/v1/forecast?latitude=40.7957&longitude=-73.6957&current=temperature_2m,precipitation_probability,weathercode&temperature_unit=fahrenheit&timezone=America/New_York")
      .then(r => r.json())
      .then(d => {
        const c = d?.current;
        if (c) setWeather({ temp: Math.round(c.temperature_2m), code: c.weathercode, rainChance: c.precipitation_probability ?? 0 });
      })
      .catch(() => {});

    Promise.all([
      fetch("/api/bookings",      { headers: h }).then(r => r.json()),
      fetch("/api/clients",       { headers: h }).then(r => r.json()),
      fetch("/api/reviews",       { headers: h }).then(r => r.json()),
      fetch("/api/admin/member-stats", { headers: h }).then(r => r.json()).catch(() => null),
    ]).then(([b, c, r, ms]) => {
      setBookings(Array.isArray(b) ? b : []);
      setClients(Array.isArray(c) ? c : []);
      setReviews(Array.isArray(r) ? r : []);
      if (ms && !ms.error) setMemberStats(ms);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Auto-refresh every 30 seconds (silent, no loading spinner)
    const poll = setInterval(async () => {
      const heads = { Authorization: `Bearer ${adminKey}` };
      const [b, c] = await Promise.all([
        fetch("/api/bookings", { headers: heads }).then(r => r.json()).catch(() => null),
        fetch("/api/clients",  { headers: heads }).then(r => r.json()).catch(() => null),
      ]);
      if (Array.isArray(b)) setBookings(b);
      if (Array.isArray(c)) setClients(c);
    }, 30000);
    return () => clearInterval(poll);
  }, [adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cancelBooking(b: DashBooking) {
    if (!confirm(`Cancel ${b.name}'s appointment on ${b.date} at ${b.time}?`)) return;
    setCancelling(b.id);
    await fetch(`/api/bookings/${b.id}`, {
      method: "PATCH",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", skipSquare: true }),
    });
    setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: "cancelled" } : x));
    setCancelling(null);
  }

  async function saveEdit() {
    if (!showEdit) return;
    setEditSaving(true);
    const oldPhone = (showEdit.phone ?? "").replace(/\D/g,"").slice(-10);
    const oldDate  = showEdit.date;

    await fetch(`/api/bookings/${showEdit.id}`, {
      method: "PATCH",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        name:          editForm.name,
        phone:         editForm.phone,
        email:         editForm.email,
        service_label: editForm.service_label,
        date:          editForm.date,
        time:          editForm.time,
        duration_min:  editForm.duration_min,
        notes:         editForm.notes,
        skipSquare:    true,
      }),
    });

    // Sync matching client records
    const newPhone = editForm.phone.replace(/\D/g,"").slice(-10);
    const nameParts = editForm.name.trim().split(/\s+/);
    const matchedClients = clients.filter(c => {
      const cp = (c.phone ?? "").replace(/\D/g,"").slice(-10);
      const samePhone = oldPhone && cp === oldPhone;
      const sameEmail = showEdit.email && c.email === showEdit.email;
      return (samePhone || sameEmail) && c.visit_date === oldDate;
    });
    await Promise.all(matchedClients.map(c =>
      fetch(`/api/clients/${c.id}`, {
        method: "PATCH",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: nameParts[0] ?? editForm.name,
          last_name:  nameParts.slice(1).join(" ") || "",
          phone:      editForm.phone,
          email:      editForm.email,
          visit_date: editForm.date,
        }),
      })
    ));

    setBookings(prev => prev.map(x => x.id === showEdit.id ? {
      ...x,
      name:          editForm.name,
      phone:         editForm.phone,
      email:         editForm.email,
      service_label: editForm.service_label,
      date:          editForm.date,
      time:          editForm.time,
      duration_min:  editForm.duration_min,
    } : x));
    setClients(prev => prev.map(c => {
      const cp = (c.phone ?? "").replace(/\D/g,"").slice(-10);
      const matched = matchedClients.find(m => m.id === c.id);
      if (!matched) return c;
      return { ...c, phone: newPhone ? editForm.phone : c.phone, email: editForm.email, visit_date: editForm.date };
    }));
    setEditSaving(false);
    setShowEdit(null);
  }

  async function syncNow() {
    setSyncing(true);
    await fetch("/api/admin/sync-square-bookings", {
      method: "POST",
      headers: h,
    });
    await reload();
    setSyncing(false);
  }

  async function addBooking() {
    if (!addForm.name.trim() || !addForm.date || !addForm.service_label.trim()) {
      setAddError("Name, date and service are required."); return;
    }
    setAddSaving(true); setAddError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name, phone: addForm.phone || "—",
        email: addForm.email || "noreply@yeeeyelashes.com",
        service: "admin", serviceKey: "admin-created",
        serviceLabel: addForm.service_label,
        date: addForm.date, time: addForm.time,
        duration: `${addForm.duration_min}min`, lang: "en",
      }),
    });
    if (res.ok) {
      const { bookingId } = await res.json();
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      await reload();
      setShowAdd(false);
      setAddForm(EMPTY_ADD);
    } else {
      setAddError("Failed to create. Please try again.");
    }
    setAddSaving(false);
  }

  const TZ = "America/New_York";
  const todayStr   = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  const today      = new Date(todayStr + "T12:00:00");

  const [yr, mo] = todayStr.split("-");
  const monthStart = `${yr}-${mo}-01`;

  const dow = today.getDay();
  const wsDate = new Date(today);
  wsDate.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
  const weekStartStr = wsDate.toLocaleDateString("en-CA", { timeZone: TZ });
  const weDate = new Date(wsDate);
  weDate.setDate(wsDate.getDate() + 6);
  const weekEndStr = weDate.toLocaleDateString("en-CA", { timeZone: TZ });

  const n7Date = new Date(today);
  n7Date.setDate(today.getDate() + 7);
  const next7 = n7Date.toLocaleDateString("en-CA", { timeZone: TZ });

  const normP = (p: string) => (p ?? "").replace(/\D/g, "").slice(-10);

  const todayAppts  = bookings.filter(b => b.date === todayStr && b.status !== "cancelled");
  const weekAppts   = bookings.filter(b => b.date >= weekStartStr && b.date <= weekEndStr && b.status !== "cancelled");
  const monthEnd    = `${yr}-${mo}-${new Date(parseInt(yr), parseInt(mo), 0).getDate().toString().padStart(2, "0")}`;
  const monthVisits = bookings.filter(b => b.date >= monthStart && b.date <= monthEnd && b.status !== "cancelled");

  // Build confirmed booking set: "normPhone|date" or "email|date" for non-cancelled bookings
  const confirmedSet = new Set<string>();
  const anyBookingSet = new Set<string>(); // all booking dates (including cancelled)
  for (const b of bookings) {
    const bk = normP(b.phone) || b.email;
    if (!bk || !b.date) continue;
    anyBookingSet.add(`${bk}|${b.date}`);
    if (b.status !== "cancelled") confirmedSet.add(`${bk}|${b.date}`);
  }

  const seen = new Set<string>();
  const visitDatesMap = new Map<string, Set<string>>();
  const firstVisitMap = new Map<string, string>(); // key → earliest visit date
  for (const c of clients) {
    if (c.owner === "elly") continue;
    if (c.deleted) continue;
    const k = normP(c.phone ?? "") || c.email || c.id;
    seen.add(k);
    if (!visitDatesMap.has(k)) visitDatesMap.set(k, new Set());
    if (c.visit_date) {
      // Only count this date if there's a confirmed booking, or no booking at all (manually added)
      const hasBooking    = anyBookingSet.has(`${k}|${c.visit_date}`);
      const hasConfirmed  = confirmedSet.has(`${k}|${c.visit_date}`);
      if (!hasBooking || hasConfirmed) {
        visitDatesMap.get(k)!.add(c.visit_date);
        const prev = firstVisitMap.get(k);
        if (!prev || c.visit_date < prev) firstVisitMap.set(k, c.visit_date);
      }
    }
  }
  const returning = [...visitDatesMap.values()].filter(s => s.size > 1).length;
  const returningThisMonth = [...visitDatesMap.values()].filter(s =>
    s.size > 1 && [...s].some(d => d >= monthStart && d <= todayStr)
  ).length;
  const newClientsThisMonth = [...firstVisitMap.values()].filter(d => d >= monthStart && d <= todayStr).length;

  const nowMin = (() => {
    const now = new Date();
    const etStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
    return parseTimeMin(etStr);
  })();

  const upcoming = bookings
    .filter(b => {
      if (b.status === "cancelled") return false;
      if (b.date > next7) return false;
      if (b.date < todayStr) return false;
      if (b.date === todayStr) {
        const endMin = parseTimeMin(b.time) + (b.duration_min ?? 60);
        return endMin > nowMin;
      }
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || parseTimeMin(a.time) - parseTimeMin(b.time))
    .filter((b, _, arr) => {
      // Deduplicate: keep first occurrence of same phone+date+time
      const key = `${(b.phone ?? "").replace(/\D/g,"").slice(-10)}|${b.date}|${b.time}`;
      return arr.findIndex(x =>
        `${(x.phone ?? "").replace(/\D/g,"").slice(-10)}|${x.date}|${x.time}` === key
      ) === arr.indexOf(b);
    });

  const isAutoNote = (n: string) => !n || n === "Square booking"
    || /^Square appt \d{4}-\d{2}-\d{2}/.test(n)
    || /^Client:/i.test(n)
    || /new customer/i.test(n)
    || /groupon/i.test(n)
    || /came in/i.test(n)
    || /removal.*discount/i.test(n)
    || /^\/\/ Merged on/i.test(n)
    || /Following fields were not transferred/i.test(n);

  function getClientInfo(b: DashBooking) {
    const bPhone = normP(b.phone);
    const matched = clients.filter(c =>
      c.owner !== "elly" && (
        (bPhone && normP(c.phone) === bPhone) ||
        (b.email && c.email === b.email)
      )
    );
    const dates = [...new Set(matched.map(c => c.visit_date).filter(d => {
      if (!d) return false;
      const k = bPhone || (b.email ?? "");
      return !anyBookingSet.has(`${k}|${d}`) || confirmedSet.has(`${k}|${d}`);
    }))]
      .sort((a, z) => z.localeCompare(a));
    const notes = [...new Set(matched.map(c => c.notes).filter(n => n && !isAutoNote(n)))];
    return { dates, notes };
  }

  const v = (n: number | string) => loading ? "…" : String(n);

  const STATS = [
    { label: "Today",             value: v(todayAppts.length),       sub: "appointments"   },
    { label: "This Week",         value: v(weekAppts.length),        sub: "appointments"   },
    { label: "Visits This Month", value: v(monthVisits.length),      sub: "total visits"   },
    { label: "New This Month",    value: v(newClientsThisMonth),     sub: "new clients"    },
    { label: "Total Clients",     value: v(clientCount ?? seen.size), sub: "in database"    },
    { label: "Returning Clients", value: v(returning), sub: "2+ visits",
      dual: { left: { value: v(returningThisMonth), sub: "this month" }, right: { value: v(returning), sub: "all time" } } },
    { label: "Google Reviews",    value: v(reviews.filter(r => !r.deleted_from_google).length),
      sub: loading ? "…" : reviews.length > 0 ? "5★" : "no reviews yet" },
  ];

  const upcomingBirthdays = clients.flatMap(c => {
    if (!c.birthday) return [];
    const [bm, bd] = c.birthday.split("/").map(Number);
    if (!bm || !bd) return [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
      d.setDate(d.getDate() + i);
      if (d.getMonth() + 1 === bm && d.getDate() === bd) {
        return [{ ...c, daysUntil: i }];
      }
    }
    return [];
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  const tomorrowStr = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("en-CA", { timeZone: TZ });
  })();

  const fmtGroupHeader = (d: string) => {
    if (d === todayStr)    return "TODAY";
    if (d === tomorrowStr) return "TOMORROW";
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).toUpperCase();
  };

  // Group upcoming by date
  const groups: { date: string; appts: DashBooking[] }[] = [];
  for (const b of upcoming) {
    const last = groups[groups.length - 1];
    if (last && last.date === b.date) last.appts.push(b);
    else groups.push({ date: b.date, appts: [b] });
  }

  const DAY_QUOTES: Record<number, { label: string; quotes: [string, string][] }> = {
    0: { label: "Sunday 😴", quotes: [
      ["😴 It's Sunday.", "🌅 Go enjoy your day. Admin can wait."],
      ["🚫 Stop checking admin.", "🎉 Today is your day off."],
      ["☕ No appointments.", "😌 No stress. Just relax."],
      ["🤍 Betty, close this page.", "👋 We'll see you tomorrow."],
      ["🌿 Rest is productive too.", "☀️ Enjoy your Sunday."],
      ["😌 Today's task:", "🛋️ Do absolutely nothing."],
      ["✨ Admin will still be here tomorrow.", "🌙 Your Sunday won't."],
      ["📱 Step away from the dashboard.", "🌸 Real life needs you today."],
      ["💕 You've earned today.", "🎊 Now go enjoy it."],
      ["⚠️ Unauthorized access detected.", "😆 Employees are required to enjoy Sunday."],
    ]},
    1: { label: "Monday ☕", quotes: [
      ["💙 Blue Monday?", "✨ Not at Yee Eyelashes."],
      ["☕ Coffee first.", "💅 Beautiful lashes second."],
      ["✨ New week.", "😊 New clients. New smiles."],
    ]},
    2: { label: "Tuesday 🌼", quotes: [
      ["🌼 Tuesday already?", "💪 You're doing better than you think."],
      ["✨ One client at a time.", "🎨 One masterpiece at a time."],
      ["💕 Tuesdays are underrated.", "😌 Just like quiet confidence."],
    ]},
    3: { label: "Wednesday 🌸", quotes: [
      ["🎉 Halfway through!", "😎 Weekend can wait."],
      ["✨ Wednesday check.", "🌟 You're still amazing."],
      ["🤍 Midweek magic starts here.", "🌸 Let's make today beautiful."],
    ]},
    4: { label: "Thursday 🌷", quotes: [
      ["😌 Thursday called.", "🎊 Friday is on the way."],
      ["✨ Almost there.", "💅 Keep those lashes flawless."],
      ["💕 Good things take time.", "🌱 Luckily, you're patient."],
    ]},
    5: { label: "Friday 🎉", quotes: [
      ["🎉 Friday vibes only.", "💫 Let's sparkle today."],
      ["✨ Today's goal:", "💅 Beautiful lashes & happy clients."],
      ["🥳 Smile.", "🎊 It's officially Friday."],
    ]},
    6: { label: "Saturday ☀️", quotes: [
      ["☀️ Saturdays are for beauty.", "💄 Let's make today gorgeous."],
      ["💕 Fully booked?", "🎉 That's a good problem."],
      ["✨ Another busy Saturday.", "🏆 Another beautiful success."],
    ]},
  };

  const nowNY = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const dayOfWeek = nowNY.getDay();
  const dayData = DAY_QUOTES[dayOfWeek];
  const todayQuote = dayData.quotes[new Date(todayStr).getDate() % dayData.quotes.length];

  const hour = nowNY.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  function dismissPopup() {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    localStorage.setItem(`betty-popup-${today}`, "1");
    setShowPopup(false);
  }

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-50">

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="animate-envelope-open relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Gold top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#C9A84C] to-[#e8c97a]" />

            <div className="animate-card-content px-5 sm:px-7 pt-4 sm:pt-6 pb-8 sm:pb-7">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-5">
                <div>
                  <p className="text-[14px] sm:text-[15px] font-semibold text-[#C9A84C]">{greeting}, Betty</p>
                  <p className="text-[13px] sm:text-[14px] text-neutral-400 mt-0.5">{dayData.label} · {todayStr}</p>
                </div>
                <button onClick={dismissPopup} className="text-neutral-300 hover:text-neutral-500 transition-colors text-xl leading-none mt-0.5">✕</button>
              </div>

              {/* Quote */}
              <div className="mb-5 sm:mb-6">
                <p className="text-[20px] sm:text-[22px] font-bold text-neutral-800 leading-snug">{todayQuote[0]}</p>
                <p className="text-[18px] sm:text-[20px] font-bold text-neutral-600 leading-snug mt-1">{todayQuote[1]}</p>
              </div>

              {/* Weather strip */}
              {weather && (
                <div className="bg-neutral-50 rounded-xl px-4 py-3 sm:py-3.5 mb-5 sm:mb-6 flex items-center gap-3">
                  <p className="text-[28px] sm:text-[32px] leading-none">{weatherIcon(weather.code)}</p>
                  <div className="flex-1">
                    <p className="text-[14px] sm:text-[15px] font-semibold text-neutral-700">{weather.temp}°F &nbsp;·&nbsp; {weatherDesc(weather.code)}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {weather.rainChance >= 40 && (
                        <p className="text-[12px] sm:text-[13px] text-blue-500 font-medium">☂️ Don&apos;t forget your umbrella! ({weather.rainChance}%)</p>
                      )}
                      {weather.temp >= 85 && (
                        <p className="text-[12px] sm:text-[13px] text-orange-400 font-medium">💧 It&apos;s hot today — stay hydrated!</p>
                      )}
                      {weather.rainChance < 40 && weather.temp < 85 && (
                        <p className="text-[12px] sm:text-[13px] text-neutral-400">Looks good out there today.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA button */}
              <button
                onClick={dismissPopup}
                className="w-full py-3.5 sm:py-3 rounded-xl bg-[#C9A84C] text-white text-[15px] sm:text-[14px] font-semibold tracking-wide active:bg-[#b8963e] hover:bg-[#b8963e] transition-colors"
              >
                Let&apos;s go ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#1C1C1C]">Dashboard</h2>
        <p className="text-[13px] text-neutral-400 mt-0.5">{todayStr}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5">{s.label}</p>
            {s.dual ? (
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1C] leading-none mb-1">{s.dual.left.value}</p>
                  <p className="text-[10px] text-neutral-400">{s.dual.left.sub}</p>
                </div>
                <div className="text-neutral-200 text-[20px] leading-none mt-1">/</div>
                <div>
                  <p className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1C] leading-none mb-1">{s.dual.right.value}</p>
                  <p className="text-[10px] text-neutral-400">{s.dual.right.sub}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[32px] sm:text-[36px] font-bold text-[#1C1C1C] leading-none mb-1">{s.value}</p>
                <p className="text-[10px] text-neutral-400">{s.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Member Club Stats ── */}
      {memberStats && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
          <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-3">✦ Member Club</p>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-[22px] font-bold text-[#1C1C1C]">{memberStats.total_members}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Members</p>
            </div>
            <div className="text-center border-l border-neutral-100">
              <p className="text-[22px] font-bold text-[#C9A84C]">{memberStats.active_coupons}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Active Coupons</p>
            </div>
            <div className="text-center border-l border-neutral-100">
              <p className="text-[22px] font-bold text-[#1C1C1C]">{memberStats.pending_referrals}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Referrals Pending</p>
            </div>
            <div className="text-center border-l border-neutral-100">
              <p className="text-[22px] font-bold text-[#1C1C1C]">{memberStats.completed_referrals}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Referrals Done</p>
            </div>
          </div>
        </div>
      )}

      {upcomingBirthdays.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
          <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-3">🎂 Upcoming Birthdays</p>
          <div className="flex flex-col gap-2">
            {upcomingBirthdays.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1C1C1C]">
                  {`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Unknown"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-neutral-400">{c.birthday}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    c.daysUntil === 0
                      ? "bg-pink-100 text-pink-600"
                      : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {c.daysUntil === 0 ? "Today!" : `In ${c.daysUntil} day${c.daysUntil === 1 ? "" : "s"}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-[#1C1C1C]">Upcoming Appointments</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={syncNow}
            disabled={syncing}
            className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 text-[12px] font-semibold text-neutral-500 rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all disabled:opacity-40">
            <svg className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            {syncing ? "Syncing…" : "Sync"}
          </button>
          <button
            onClick={() => { setAddForm(EMPTY_ADD); setAddError(""); setShowAdd(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            <span className="text-[16px] leading-none font-light">+</span> New
          </button>
        </div>
      </div>

      {loading ? (
        <p className="bg-white border border-neutral-200 rounded-xl px-5 py-8 text-[13px] text-neutral-400">Loading…</p>
      ) : upcoming.length === 0 ? (
        <p className="bg-white border border-neutral-200 rounded-xl px-5 py-8 text-center text-[13px] text-neutral-300">No upcoming appointments</p>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {groups.map(({ date, appts }) => (
            <div key={date}>
              {/* Date header */}
              <div className="px-4 sm:px-5 py-2.5 bg-neutral-50 border-b border-neutral-100">
                <span className="text-[11px] font-bold tracking-[0.08em] text-neutral-500">
                  {fmtGroupHeader(date)}
                </span>
              </div>
              {/* Appointments */}
              {appts.map((b, i) => {
                const { dates, notes } = getClientInfo(b);
                return (
                  <div
                    key={b.id}
                    className={`px-4 sm:px-5 py-3.5 sm:py-4 ${i < appts.length - 1 ? "border-b border-neutral-50" : ""} hover:bg-neutral-50 transition-colors`}
                  >
                    {/* Mobile: stacked; Desktop: side-by-side */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Time */}
                      <div className="w-[130px] sm:w-[170px] flex-shrink-0 pt-0.5">
                        <p className="text-[12px] sm:text-[13px] text-neutral-500 tabular-nums leading-snug">
                          {fmtTimeRange(b.time, b.duration_min)}
                        </p>
                      </div>
                      {/* Client info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] sm:text-[14px] font-semibold text-[#1C1C1C] leading-snug">
                          {b.name || "—"}
                        </p>
                        {b.service_label && (
                          <p className="text-[11px] sm:text-[12px] text-neutral-400 mt-0.5">{b.service_label}</p>
                        )}
                        {notes.length > 0 && (
                          <p className="text-[10px] sm:text-[11px] text-[#C9A84C] mt-1 leading-snug">{notes.join(" · ")}</p>
                        )}
                      </div>
                      {/* Right: visit count + actions */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                        {dates.length > 0 && (
                          <span className="text-[13px] font-bold text-[#C9A84C]">{dates.length}x</span>
                        )}
                        <button
                          onClick={() => { setEditForm({ name: b.name, phone: b.phone ?? "", email: b.email ?? "", service_label: b.service_label ?? "", date: b.date, time: b.time, duration_min: b.duration_min ?? 90, notes: b.notes ?? "" }); setShowEdit(b); }}
                          className="text-[11px] text-neutral-400 hover:text-[#1C1C1C] transition-colors px-1 py-1 -mx-1">
                          Edit
                        </button>
                        <button
                          onClick={() => cancelBooking(b)}
                          disabled={cancelling === b.id}
                          className="text-[11px] text-neutral-300 hover:text-red-400 transition-colors disabled:opacity-40 px-1 py-1 -mx-1">
                          {cancelling === b.id ? "…" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Appointment Modal ── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowEdit(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl overflow-y-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1C1C1C]">Edit Appointment</h3>
              <button onClick={() => setShowEdit(null)} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Client Name</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="917-000-0000" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Email</label>
                <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="optional" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Service</label>
                <input value={editForm.service_label} onChange={e => setEditForm(p => ({ ...p, service_label: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Date</label>
                  <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Time</label>
                  <select value={editForm.time} onChange={e => setEditForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C] bg-white">
                    {APPT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Duration (min)</label>
                <input type="number" min={15} max={300} step={15} value={editForm.duration_min}
                  onChange={e => setEditForm(p => ({ ...p, duration_min: parseInt(e.target.value) || 60 }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Notes</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C] resize-none"
                  placeholder="Client preferences, lash style, etc." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex gap-3 justify-end">
              <button onClick={() => setShowEdit(null)} className="px-4 py-2 text-[13px] text-neutral-500">Cancel</button>
              <button onClick={saveEdit} disabled={editSaving}
                className="px-5 py-2 bg-[#1C1C1C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Appointment Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl overflow-y-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1C1C1C]">New Appointment</h3>
              <button onClick={() => setShowAdd(false)} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Client Name *</label>
                <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="e.g. Sabrina" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Phone</label>
                <input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="917-000-0000" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Email</label>
                <input value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="optional" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Service *</label>
                <input value={addForm.service_label} onChange={e => setAddForm(p => ({ ...p, service_label: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="e.g. New Set" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Date *</label>
                  <input type="date" value={addForm.date} onChange={e => setAddForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Time</label>
                  <select value={addForm.time} onChange={e => setAddForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C] bg-white">
                    {APPT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Duration (min)</label>
                <input type="number" min={15} max={300} step={15} value={addForm.duration_min}
                  onChange={e => setAddForm(p => ({ ...p, duration_min: parseInt(e.target.value) || 90 }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              {addError && <p className="text-[12px] text-red-500">{addError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex gap-3 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-[13px] text-neutral-500">Cancel</button>
              <button onClick={addBooking} disabled={addSaving}
                className="px-5 py-2 bg-[#1C1C1C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                {addSaving ? "Saving…" : "Add Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

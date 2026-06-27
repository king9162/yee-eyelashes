"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Booking = {
  id: string; name: string; service_label: string;
  date: string; time: string; duration_min: number;
  status: string; phone: string; email: string; notes?: string;
};

type ClientRecord = {
  id: string; first_name: string; last_name: string;
  phone: string; email: string; notes: string; visit_date: string; owner: string;
};

type NewAppt = {
  name: string; phone: string; email: string; service_label: string;
  date: string; time: string; duration_min: number; notes: string;
};
const EMPTY_APPT: NewAppt = { name:"", phone:"", email:"", service_label:"", date:"", time:"9:30 AM", duration_min:60, notes:"" };
const APPT_TIMES = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

const SLOT_H  = 48;  // px per 30 min
const BASE    = 9 * 60; // 9:00 AM in minutes
const SLOTS   = 22;  // 9 AM – 8 PM (22 half-hour slots)
const TOTAL_H = SLOTS * SLOT_H;

const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat"];

function parseTime(t: string): number {
  const [hm, period] = t.split(" ");
  let [h, m] = hm.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function getMonday(d: Date): Date {
  const day  = d.getDay();
  // Sunday (0): show next week's Mon; otherwise go back to Mon of current week
  const diff = day === 0 ? 1 : 1 - day;
  const mon  = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fmtLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-green-100 border-green-300 text-green-800",
  pending:   "bg-yellow-50 border-yellow-300 text-yellow-800",
  cancelled: "bg-neutral-100 border-neutral-300 text-neutral-400 line-through",
};

function normPhone(p: string) { return (p || "").replace(/\D/g, "").slice(-10); }

export default function CalendarView({ adminKey }: { adminKey: string }) {
  const [bookings,    setBookings]   = useState<Booking[]>([]);
  const [weekStart,   setWeekStart]  = useState<Date>(() => getMonday(new Date()));
  const [selected,    setSelected]   = useState<Booking | null>(null);
  const [loading,     setLoading]    = useState(true);
  const [creating,    setCreating]   = useState(false);
  const [form,        setForm]       = useState<NewAppt>(EMPTY_APPT);
  const [submitting,  setSubmitting] = useState(false);
  const [createError, setCreateError]= useState("");
  const [syncAlert,   setSyncAlert]  = useState<Booking[]>([]);

  // Client record panel
  const [clients,           setClients]          = useState<ClientRecord[]>([]);
  const [selectedClient,    setSelectedClient]   = useState<ClientRecord | null>(null);
  const [selectedClientAll, setSelectedClientAll]= useState<ClientRecord[]>([]);
  const [editMode,          setEditMode]         = useState(false);
  const [clientForm,        setClientForm]       = useState<Partial<ClientRecord>>({});
  const [saving,            setSaving]           = useState(false);
  const [cancelling,        setCancelling]       = useState(false);
  const editFormRef = useRef<HTMLDivElement>(null);

  const isAutoNote = (n: string) => !n || n === "Square booking"
    || /^Square appt \d{4}-\d{2}-\d{2}/.test(n)
    || /^Client:/i.test(n) || /new customer/i.test(n)
    || /groupon/i.test(n) || /came in/i.test(n)
    || /removal.*discount/i.test(n);

  function setField(k: keyof NewAppt, v: string|number) { setForm(p => ({ ...p, [k]: v })); }
  function setClientField(k: keyof ClientRecord, v: string) { setClientForm(p => ({ ...p, [k]: v })); }

  async function createAppt() {
    if (!form.name.trim() || !form.date || !form.service_label.trim()) {
      setCreateError("Name, date and service are required."); return;
    }
    setSubmitting(true); setCreateError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, phone: form.phone || "—",
          email: form.email || "noreply@yeeeyelashes.com",
          service: "admin", serviceKey: "admin-created",
          serviceLabel: form.service_label,
          date: form.date, time: form.time,
          notes: form.notes, duration: `${form.duration_min}min`, lang: "en",
        }),
      });
      if (res.ok) {
        const { bookingId } = await res.json();
        await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
          body: JSON.stringify({ status: "confirmed" }),
        });
        const nb: Booking = {
          id: bookingId, name: form.name, phone: form.phone, email: form.email,
          service_label: form.service_label, date: form.date, time: form.time,
          duration_min: form.duration_min, notes: form.notes || undefined, status: "confirmed",
        };
        setBookings(prev => [...prev, nb]);
        setCreating(false); setForm(EMPTY_APPT);
      } else {
        setCreateError("Failed to create. Please try again.");
      }
    } catch { setCreateError("Network error."); }
    setSubmitting(false);
  }

  const loadBookings = useCallback(async (isManual = false) => {
    setLoading(true);
    try {
      const d = await fetch("/api/bookings", { headers: { Authorization: `Bearer ${adminKey}` } }).then(r => r.json());
      const fresh: Booking[] = Array.isArray(d) ? d : [];
      if (isManual) {
        setBookings(prev => {
          const prevIds = new Set(prev.map(b => b.id));
          const added = fresh.filter(b => !prevIds.has(b.id) && b.status !== "cancelled");
          // Also check for date/time changes on existing bookings
          const changed = fresh.filter(b => {
            const old = prev.find(p => p.id === b.id);
            return old && (old.date !== b.date || old.time !== b.time) && b.status !== "cancelled";
          });
          if (added.length > 0 || changed.length > 0) {
            setSyncAlert([...added, ...changed]);
          }
          return fresh;
        });
      } else {
        setBookings(fresh);
      }
    } catch { /* non-fatal */ }
    setLoading(false);
  }, [adminKey]);

  useEffect(() => {
    loadBookings(false);
    const iv = setInterval(() => loadBookings(false), 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [loadBookings]);

  // Load all clients once
  useEffect(() => {
    fetch("/api/clients", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [adminKey]);

  // Match client when booking selected
  useEffect(() => {
    if (!selected) { setSelectedClient(null); setSelectedClientAll([]); setEditMode(false); return; }
    const ph = normPhone(selected.phone);
    const em = (selected.email || "").toLowerCase();
    const all = clients.filter(c => c.owner === "main").filter(c => {
      const cp = normPhone(c.phone);
      const ce = (c.email || "").toLowerCase();
      return (ph && cp === ph) || (em && ce === em);
    });
    setSelectedClientAll(all);
    setSelectedClient(all[0] ?? null);
    setEditMode(false);
  }, [selected, clients]);

  async function saveClient() {
    if (!clientForm) return;
    setSaving(true);
    try {
      const isNew = !clientForm.id;
      const url    = isNew ? "/api/clients" : `/api/clients/${clientForm.id}`;
      const method = isNew ? "POST" : "PATCH";
      const r = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: clientForm.first_name ?? "",
          last_name:  clientForm.last_name  ?? "",
          phone:      clientForm.phone      ?? "",
          email:      clientForm.email      ?? "",
          notes:      clientForm.notes      ?? "",
          visit_date: clientForm.visit_date ?? "",
          owner:      "main",
        }),
      });
      if (r.ok) {
        const saved: ClientRecord = await r.json();
        setClients(prev => isNew ? [...prev, saved] : prev.map(c => c.id === saved.id ? saved : c));
        setSelectedClient(saved);
        setEditMode(false);
      }
    } catch { /* non-fatal */ }
    setSaving(false);
  }

  async function cancelBooking() {
    if (!selected || !confirm(`Cancel ${selected.name}'s appointment on ${selected.date} at ${selected.time}?`)) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, status: "cancelled" } : b));
        setSelected(null);
      }
    } catch { /* non-fatal */ }
    setCancelling(false);
  }

  const weekDays = DAYS_SHORT.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekDates = new Set(weekDays.map(fmtDate));

  const weekBookings = bookings.filter(b =>
    weekDates.has(b.date) && b.status !== "cancelled"
  );

  function bookingsForDay(d: Date) {
    return weekBookings.filter(b => b.date === fmtDate(d));
  }

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday  = () => setWeekStart(getMonday(new Date()));

  const weekLabel = `${fmtLabel(weekDays[0])} – ${fmtLabel(weekDays[5])}`;

  // Time labels: 9 AM, 9:30, 10 AM, ...
  const timeLabels: string[] = [];
  for (let i = 0; i < SLOTS; i++) {
    const totalMin = BASE + i * 30;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (m === 0) {
      timeLabels.push(h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);
    } else {
      timeLabels.push("");
    }
  }

  const today = fmtDate(new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center border border-neutral-200 hover:border-neutral-400 text-neutral-500 transition-colors">‹</button>
          <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center border border-neutral-200 hover:border-neutral-400 text-neutral-500 transition-colors">›</button>
          <span className="text-[13px] font-medium text-[#1C1C1C] ml-1">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={async () => {
              setLoading(true);
              try {
                await fetch("/api/admin/sync-square-bookings", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${adminKey}` },
                });
                // Also refresh clients list
                const cd = await fetch("/api/clients", { headers: { Authorization: `Bearer ${adminKey}` } }).then(r => r.json());
                setClients(Array.isArray(cd) ? cd : []);
              } catch { /* non-fatal */ }
              await loadBookings(true);
            }} disabled={loading}
            className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-neutral-200 hover:border-neutral-400 text-neutral-500 transition-colors disabled:opacity-40">
            {loading ? "…" : "↻ Sync"}
          </button>
          <button onClick={goToday} className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-neutral-200 hover:border-neutral-400 text-neutral-500 transition-colors">Today</button>
          <button onClick={() => { setCreating(true); setForm(EMPTY_APPT); setCreateError(""); }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            <span className="text-[18px] leading-none font-light">+</span> New Appointment
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="flex min-w-[700px]">
          {/* Time labels column */}
          <div className="w-14 shrink-0 border-r border-neutral-100">
            <div className="h-10 border-b border-neutral-100" /> {/* header row */}
            {timeLabels.map((label, i) => (
              <div key={i} style={{ height: SLOT_H }}
                className={`border-b ${i % 2 === 0 ? "border-neutral-100" : "border-neutral-50"} pr-2 flex items-start justify-end`}>
                {label && <span className="text-[10px] text-neutral-400 mt-[-6px]">{label}</span>}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, di) => {
            const isToday = fmtDate(day) === today;
            const dayBookings = bookingsForDay(day);
            return (
              <div key={di} className="flex-1 min-w-0 border-r border-neutral-100 last:border-r-0">
                {/* Day header */}
                <div className={`h-10 border-b border-neutral-100 flex flex-col items-center justify-center gap-0 ${isToday ? "bg-[#C9A84C]/8" : ""}`}>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-400">{DAYS_SHORT[di]}</span>
                  <span className={`text-[12px] font-medium ${isToday ? "text-[#C9A84C]" : "text-[#1C1C1C]"}`}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Events area */}
                <div className="relative" style={{ height: TOTAL_H }}>
                  {/* Hour lines */}
                  {timeLabels.map((_, i) => (
                    <div key={i} style={{ top: i * SLOT_H, height: SLOT_H }}
                      className={`absolute left-0 right-0 border-b ${i % 2 === 0 ? "border-neutral-100" : "border-neutral-50"}`} />
                  ))}

                  {/* Booking blocks — with overlap detection */}
                  {(() => {
                    type Placed = { b: Booking; top: number; ht: number; col: number; cols: number };
                    const placed: Placed[] = [];
                    for (const b of dayBookings) {
                      const mins = parseTime(b.time);
                      const top  = (mins - BASE) / 30 * SLOT_H;
                      const ht   = Math.max((b.duration_min ?? 60) / 30 * SLOT_H, SLOT_H);
                      if (top < 0 || top > TOTAL_H) continue;
                      // Find overlapping previously placed items
                      const overlapping = placed.filter(p => top < p.top + p.ht && top + ht > p.top);
                      // Assign smallest available column
                      const usedCols = new Set(overlapping.map(p => p.col));
                      let col = 0;
                      while (usedCols.has(col)) col++;
                      const cols = Math.max(col + 1, ...overlapping.map(p => p.cols));
                      // Widen all overlapping items to match total cols
                      for (const p of overlapping) p.cols = cols;
                      placed.push({ b, top, ht, col, cols });
                    }
                    return placed.map(({ b, top, ht, col, cols }) => {
                      const pct = 100 / cols;
                      const color = b.status === "confirmed"
                        ? "bg-green-100 border-l-2 border-l-green-500"
                        : "bg-blue-50 border-l-2 border-l-blue-400";
                      // Resolve display name: if booking says "Unknown", look up by phone in clients
                      const ph = normPhone(b.phone);
                      const em = (b.email || "").toLowerCase();
                      const matchedClient = (!b.name || b.name === "Unknown")
                        ? clients.filter(c => c.owner === "main").find(c =>
                            (ph && normPhone(c.phone) === ph) || (em && (c.email || "").toLowerCase() === em)
                          )
                        : null;
                      const displayName = matchedClient
                        ? `${matchedClient.first_name} ${matchedClient.last_name}`.trim() || b.name
                        : b.name;
                      return (
                        <button key={b.id}
                          onClick={() => setSelected(b)}
                          style={{ top: top + 1, height: ht - 2, left: `calc(${col * pct}% + 2px)`, width: `calc(${pct}% - 4px)` }}
                          className={`absolute rounded-sm px-1.5 py-1 text-left overflow-hidden hover:opacity-80 transition-opacity ${color}`}>
                          <p className="text-[10px] font-semibold text-[#1C1C1C] leading-tight truncate">{b.time}</p>
                          <p className="text-[10px] text-[#1C1C1C] leading-tight truncate">{displayName}</p>
                          {ht > SLOT_H && <p className="text-[9px] text-neutral-500 leading-tight truncate">{b.service_label}</p>}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Appointment modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <p className="text-[15px] font-bold text-[#1C1C1C]">New Appointment</p>
              <button onClick={() => setCreating(false)} className="text-neutral-300 hover:text-neutral-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Name *</label>
                <input value={form.name} onChange={e => setField("name", e.target.value)}
                  placeholder="Client name"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Service *</label>
                <input value={form.service_label} onChange={e => setField("service_label", e.target.value)}
                  placeholder="e.g. New Set - 80pcs"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setField("date", e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Time</label>
                  <select value={form.time} onChange={e => setField("time", e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white">
                    {APPT_TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setField("notes", e.target.value)} rows={2}
                  placeholder="Optional"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] resize-none" />
              </div>
              {createError && <p className="text-[12px] text-red-500">{createError}</p>}
            </div>
            <div className="px-6 pb-5 flex gap-2 border-t border-neutral-100 pt-4">
              <button onClick={() => setCreating(false)}
                className="flex-1 py-2.5 text-[12px] font-bold bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 transition-colors">
                Cancel
              </button>
              <button onClick={createAppt} disabled={submitting}
                className="flex-1 py-2.5 text-[12px] font-bold bg-[#1C1C1C] text-white rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                {submitting ? "Creating…" : "Create & Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync update alert */}
      {syncAlert.length > 0 && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSyncAlert([])}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <p className="text-[15px] font-bold text-[#1C1C1C]">已更新</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">{syncAlert.length} 筆異動</p>
              </div>
              <button onClick={() => setSyncAlert([])} className="text-neutral-300 hover:text-neutral-600 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto max-h-80 divide-y divide-neutral-50">
              {syncAlert.map(b => (
                <div key={b.id} className="px-6 py-3 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0 mt-1.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#1C1C1C]">{b.name}</p>
                    <p className="text-[11px] text-neutral-400">{b.date} · {b.time}</p>
                    <p className="text-[11px] text-neutral-400">{b.service_label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-neutral-100">
              <button onClick={() => setSyncAlert([])}
                className="w-full py-2.5 text-[12px] font-bold bg-[#1C1C1C] text-white rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking detail side panel */}
      {selected && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-[360px] bg-white shadow-2xl z-50 flex flex-col">

            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-100">
              <div className="min-w-0 pr-3">
                {/* Show client's real name if matched, otherwise fall back to booking name */}
                <p className="text-[17px] font-bold text-[#1C1C1C] truncate">
                  {selectedClient
                    ? `${selectedClient.first_name} ${selectedClient.last_name}`.trim() || selected.name
                    : selected.name}
                </p>
                {selectedClient && selected.name !== `${selectedClient.first_name} ${selectedClient.last_name}`.trim() && selected.name !== "Unknown" && (
                  <p className="text-[10px] text-neutral-400">Booking: {selected.name}</p>
                )}
                <p className="text-[11px] text-neutral-400 mt-0.5">{selected.date} · {selected.time} · {selected.duration_min} min</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-neutral-300 hover:text-neutral-600 text-xl shrink-0 mt-0.5">✕</button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Service + Cancel */}
              <div className="flex items-start gap-3">
                <div className="w-1 self-stretch bg-[#C9A84C] rounded-full shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1C1C1C]">{selected.service_label}</p>
                  <p className="text-[11px] text-neutral-400">{selected.duration_min} min</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1.5 self-start">
                  <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-1 rounded-sm border ${STATUS_COLOR[selected.status] ?? "bg-neutral-100 border-neutral-200 text-neutral-400"}`}>
                    {selected.status}
                  </span>
                  {selected.status !== "cancelled" && (
                    <button onClick={cancelBooking} disabled={cancelling}
                      className="text-[9px] uppercase tracking-[0.15em] px-2 py-1 border border-red-200 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40">
                      {cancelling ? "…" : "Cancel Appt"}
                    </button>
                  )}
                </div>
              </div>

              {/* Contact */}
              {(selected.phone || selected.email) && (
                <div className="space-y-1.5">
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-[12px] text-neutral-600 hover:text-[#C9A84C] transition-colors">
                      <span className="text-neutral-300">📞</span>{selected.phone}
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-[12px] text-neutral-600 hover:text-[#C9A84C] transition-colors">
                      <span className="text-neutral-300">✉</span>{selected.email}
                    </a>
                  )}
                </div>
              )}

              {/* Booking note */}
              {selected.notes && (
                <div className="bg-neutral-50 rounded-lg px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-1">Booking Note</p>
                  <p className="text-[12px] text-neutral-600">{selected.notes}</p>
                </div>
              )}

              {/* Client Notes from My Clients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 font-semibold">Client Notes</p>
                  {selectedClient && !editMode && (
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setClientForm({ ...selectedClient });
                        setTimeout(() => editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                      }}
                      className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] hover:text-[#1C1C1C] font-semibold transition-colors">
                      Edit
                    </button>
                  )}
                </div>
                {selectedClient ? (
                  <div className="bg-[#FAFAF8] border border-[#E8E0CF] rounded-xl px-4 py-3 space-y-1.5">
                    {(() => {
                      const allNotes = selectedClientAll
                        .map(c => c.notes).filter(n => n && !isAutoNote(n));
                      const unique = [...new Set(allNotes)];
                      return unique.length > 0
                        ? unique.map((n, i) => (
                            <p key={i} className="text-[14px] text-[#1C1C1C] leading-snug font-medium">{n}</p>
                          ))
                        : <p className="text-[12px] text-neutral-300 italic">No notes yet</p>;
                    })()}
                  </div>
                ) : (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-[12px] text-neutral-400">No record found</p>
                    <button
                      onClick={() => {
                        const nameParts = selected.name.split(" ");
                        setEditMode(true);
                        setClientForm({
                          id: "", first_name: nameParts[0] ?? selected.name,
                          last_name: nameParts.slice(1).join(" ") || "",
                          phone: selected.phone ?? "", email: selected.email ?? "", notes: "",
                          visit_date: selected.date, owner: "main",
                        });
                        setTimeout(() => editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                      }}
                      className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] hover:text-[#1C1C1C] font-semibold whitespace-nowrap transition-colors">
                      + Add
                    </button>
                  </div>
                )}
              </div>

              {/* Edit client form */}
              {editMode && clientForm && (
                <div ref={editFormRef} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-500">Edit Client Record</p>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">First Name</label>
                        <input value={clientForm.first_name ?? ""} onChange={e => setClientField("first_name", e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">Last Name</label>
                        <input value={clientForm.last_name ?? ""} onChange={e => setClientField("last_name", e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Phone</label>
                      <input value={clientForm.phone ?? ""} onChange={e => setClientField("phone", e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Email</label>
                      <input value={clientForm.email ?? ""} onChange={e => setClientField("email", e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Notes</label>
                      <textarea value={clientForm.notes ?? ""} onChange={e => setClientField("notes", e.target.value)} rows={3}
                        className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C] resize-none" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setEditMode(false)}
                        className="flex-1 py-2 text-[11px] font-bold bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 transition-colors">
                        Cancel
                      </button>
                      <button onClick={saveClient} disabled={saving}
                        className="flex-1 py-2 text-[11px] font-bold bg-[#1C1C1C] text-white rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

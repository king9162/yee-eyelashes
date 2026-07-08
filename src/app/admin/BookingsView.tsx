"use client";

import { useState, useEffect } from "react";

type Booking = {
  id: string; name: string; phone: string; email: string;
  service_label: string; date: string; time: string;
  duration_min: number; notes?: string; status: string;
};

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-green-50  text-green-700  border border-green-200",
  cancelled: "bg-neutral-100 text-neutral-400 border border-neutral-200",
  noshow:    "bg-red-50 text-red-400 border border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "PENDING", confirmed: "CONFIRMED", cancelled: "CANCELLED", noshow: "NO SHOW",
};

const ALL_TIMES = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM",
  "6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

type NewAppt = {
  name: string; phone: string; email: string; service_label: string;
  date: string; time: string; duration_min: number; notes: string;
};
const EMPTY: NewAppt = { name:"", phone:"", email:"", service_label:"", date:"", time:"9:30 AM", duration_min:60, notes:"" };

export default function BookingsView({ adminKey, onClientClick }: { adminKey: string; onClientClick?: (name: string) => void }) {
  const [bookings,    setBookings]   = useState<Booking[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [filter,      setFilter]     = useState<"upcoming"|"all">("upcoming");
  const [saving,      setSaving]     = useState<string|null>(null);
  const [search,      setSearch]     = useState("");
  const [syncing,     setSyncing]    = useState(false);
  const [creating,    setCreating]   = useState(false);
  const [form,        setForm]       = useState<NewAppt>(EMPTY);
  const [submitting,  setSubmitting] = useState(false);
  const [createError, setCreateError]= useState("");
  const [detail,      setDetail]     = useState<Booking|null>(null);

  useEffect(() => {
    fetch("/api/bookings", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then(r => r.json())
      .then(d => { setBookings(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [adminKey]);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : null);
    }
    setSaving(null);
  }

  async function deleteBooking(id: string) {
    if (!confirm("Permanently delete this booking? This cannot be undone.")) return;
    setSaving(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.id !== id));
      if (detail?.id === id) setDetail(null);
    }
    setSaving(null);
  }

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
        setBookings(prev => [...prev, nb].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
        setCreating(false); setForm(EMPTY);
      } else {
        setCreateError("Failed to create. Please try again.");
      }
    } catch { setCreateError("Network error."); }
    setSubmitting(false);
  }

  function set(k: keyof NewAppt, v: string|number) { setForm(p => ({ ...p, [k]: v })); }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const shown = bookings
    .filter(b => {
      if (filter === "upcoming" && b.date < today) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.name?.toLowerCase().includes(q) || b.phone?.includes(q) ||
               b.service_label?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-neutral-200 bg-white">
        <h2 className="text-[15px] font-bold text-[#1C1C1C] mr-2">Bookings</h2>

        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, service…"
          className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C] w-56" />

        <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5 ml-auto">
          {(["upcoming","all"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] font-bold rounded-md transition-all
                ${filter === f ? "bg-white text-[#1C1C1C] shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
              {f}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={syncing}
          onClick={async () => {
            setSyncing(true);
            const res = await fetch("/api/admin/sync-square-bookings", {
              method: "POST",
              headers: { Authorization: `Bearer ${adminKey}` },
            });
            const data = await res.json().catch(() => ({}));
            setSyncing(false);
            if (res.ok) {
              const r = await fetch("/api/bookings", { headers: { Authorization: `Bearer ${adminKey}` } });
              if (r.ok) setBookings(await r.json());
              alert(`Done. ${data.synced ?? 0} bookings synced from Square.`);
            } else {
              alert(`Sync failed: ${data.error ?? "unknown error"}`);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-neutral-100 text-[#1C1C1C] text-[12px] font-bold rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50">
          {syncing ? "Syncing…" : "↻ Sync Square"}
        </button>

        <button onClick={() => { setCreating(true); setForm(EMPTY); setCreateError(""); }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
          <span className="text-[18px] leading-none font-light">+</span> New Appointment
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-white">
        {loading && <p className="px-6 py-8 text-[13px] text-neutral-400">Loading…</p>}
        {!loading && shown.length === 0 && (
          <p className="px-6 py-16 text-center text-[13px] text-neutral-300">No bookings found</p>
        )}

        {/* Desktop */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {["Date","Time","Client","Service","Status","Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map(b => (
                <tr key={b.id}
                  onClick={() => setDetail(b)}
                  className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                  <td className="px-5 py-4 text-[13px] font-semibold text-[#1C1C1C] whitespace-nowrap">{b.date}</td>
                  <td className="px-5 py-4 text-[13px] text-[#1C1C1C] whitespace-nowrap">{b.time}</td>
                  <td className="px-5 py-4">
                    {onClientClick ? (
                      <button
                        onClick={e => { e.stopPropagation(); onClientClick(b.name); }}
                        className="text-[13px] font-bold text-[#1C1C1C] hover:text-[#C9A84C] hover:underline transition-colors text-left">
                        {b.name}
                      </button>
                    ) : (
                      <p className="text-[13px] font-bold text-[#1C1C1C]">{b.name}</p>
                    )}
                    {b.phone && <p className="text-[11px] text-neutral-400">{b.phone}</p>}
                    {b.notes && <p className="text-[11px] text-[#C9A84C] mt-0.5 truncate max-w-[180px]">{b.notes}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[12px] font-semibold text-neutral-700 max-w-[200px] leading-snug">{b.service_label}</p>
                    <p className="text-[11px] text-neutral-400">{b.duration_min} min</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] uppercase tracking-[0.12em] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status] ?? STATUS_STYLE.pending}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1.5 flex-wrap">
                      {b.status === "pending" && (
                        <button disabled={saving === b.id}
                          onClick={() => updateStatus(b.id, "confirmed")}
                          className="text-[10px] font-bold px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded transition-colors disabled:opacity-40">
                          Confirm
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <button disabled={saving === b.id}
                          onClick={() => updateStatus(b.id, "noshow")}
                          className="text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-400 border border-red-200 hover:bg-red-100 rounded transition-colors disabled:opacity-40">
                          No-show
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button disabled={saving === b.id}
                          onClick={() => { if (confirm("Cancel this booking?")) updateStatus(b.id, "cancelled"); }}
                          className="text-[10px] font-bold px-3 py-1.5 bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200 rounded transition-colors disabled:opacity-40">
                          Cancel
                        </button>
                      )}
                      <button disabled={saving === b.id}
                        onClick={() => deleteBooking(b.id)}
                        className="text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 rounded transition-colors disabled:opacity-40">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-neutral-100">
          {shown.map(b => (
            <div key={b.id} className="bg-white px-4 py-4" onClick={() => setDetail(b)}>
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#1C1C1C] truncate">{b.name}</p>
                  <p className="text-[12px] text-neutral-400">{b.date} · {b.time}</p>
                  {b.phone && <p className="text-[11px] text-neutral-400">{b.phone}</p>}
                </div>
                <span className={`text-[9px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded-full shrink-0 ${STATUS_STYLE[b.status] ?? STATUS_STYLE.pending}`}>
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>

              {/* Service */}
              <p className="text-[12px] font-semibold text-neutral-600 mb-0.5">{b.service_label}</p>
              <p className="text-[11px] text-neutral-400 mb-2">{b.duration_min} min</p>
              {b.notes && <p className="text-[11px] text-[#C9A84C] mb-3 line-clamp-2">{b.notes}</p>}

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                {b.status === "pending" && (
                  <button disabled={saving === b.id} onClick={() => updateStatus(b.id, "confirmed")}
                    className="flex-1 py-2 text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg disabled:opacity-40">
                    Confirm
                  </button>
                )}
                {b.status === "confirmed" && (
                  <button disabled={saving === b.id} onClick={() => updateStatus(b.id, "noshow")}
                    className="flex-1 py-2 text-[11px] font-bold bg-red-50 text-red-400 border border-red-200 rounded-lg disabled:opacity-40">
                    No-show
                  </button>
                )}
                {b.status !== "cancelled" && (
                  <button disabled={saving === b.id} onClick={() => { if (confirm("Cancel?")) updateStatus(b.id, "cancelled"); }}
                    className="flex-1 py-2 text-[11px] font-bold bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-lg disabled:opacity-40">
                    Cancel
                  </button>
                )}
                <button disabled={saving === b.id} onClick={() => deleteBooking(b.id)}
                  className="py-2 px-3 text-[13px] bg-red-50 text-red-400 border border-red-200 rounded-lg disabled:opacity-40">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail modal ───────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <p className="text-[15px] font-bold text-[#1C1C1C]">Booking Details</p>
              <button onClick={() => setDetail(null)} className="text-neutral-300 hover:text-neutral-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-0.5">Client</p>
                <p className="text-[15px] font-bold text-[#1C1C1C]">{detail.name}</p>
                {detail.phone && <p className="text-[13px] text-neutral-500">{detail.phone}</p>}
                {detail.email && <p className="text-[13px] text-neutral-500">{detail.email}</p>}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-0.5">Service</p>
                <p className="text-[14px] font-semibold text-[#1C1C1C]">{detail.service_label}</p>
                <p className="text-[12px] text-neutral-400">{detail.duration_min} min</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-0.5">Date & Time</p>
                <p className="text-[14px] font-semibold text-[#1C1C1C]">{detail.date} · {detail.time}</p>
              </div>
              {detail.notes && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-0.5">Notes</p>
                  <p className="text-[13px] text-[#C9A84C]">{detail.notes}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-1.5">Status</p>
                <span className={`text-[11px] uppercase tracking-[0.12em] font-bold px-3 py-1 rounded-full ${STATUS_STYLE[detail.status] ?? STATUS_STYLE.pending}`}>
                  {STATUS_LABEL[detail.status] ?? detail.status}
                </span>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-2 flex-wrap">
              {detail.status === "pending" && (
                <button disabled={saving === detail.id} onClick={() => updateStatus(detail.id, "confirmed")}
                  className="flex-1 py-2.5 text-[12px] font-bold bg-[#1C1C1C] text-white rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                  Confirm
                </button>
              )}
              {detail.status === "confirmed" && (
                <button disabled={saving === detail.id} onClick={() => updateStatus(detail.id, "noshow")}
                  className="flex-1 py-2.5 text-[12px] font-bold bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40">
                  No-show
                </button>
              )}
              {detail.status !== "cancelled" && (
                <button disabled={saving === detail.id}
                  onClick={() => { if (confirm("Cancel this booking?")) updateStatus(detail.id, "cancelled"); }}
                  className="flex-1 py-2.5 text-[12px] font-bold bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-40">
                  Cancel
                </button>
              )}
              <button disabled={saving === detail.id}
                onClick={() => deleteBooking(detail.id)}
                className="w-full mt-1 py-2.5 text-[12px] font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40">
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Appointment modal ────────────────────────────── */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <p className="text-[15px] font-bold text-[#1C1C1C]">New Appointment</p>
              <button onClick={() => setCreating(false)} className="text-neutral-300 hover:text-neutral-600 text-xl">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Client */}
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold">Client Info</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Name *</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)} type="tel"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Email</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} type="email"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>

              {/* Appointment */}
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold pt-1">Appointment</p>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Service *</label>
                <input value={form.service_label} onChange={e => set("service_label", e.target.value)}
                  placeholder="e.g. New Set - 80pcs"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Time</label>
                  <select value={form.time} onChange={e => set("time", e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white">
                    {ALL_TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Duration (min)</label>
                <select value={form.duration_min} onChange={e => set("duration_min", parseInt(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white">
                  {[30,45,60,75,90,105,120,150,180].map(d => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
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
    </div>
  );
}

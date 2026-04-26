"use client";

// Tell Next.js not to index admin page
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";

type Booking = {
  id:            string;
  created_at:    string;
  name:          string;
  phone:         string;
  email:         string;
  service_label: string;
  date:          string;
  time:          string;
  notes:         string | null;
  status:        "pending" | "confirmed" | "cancelled";
};

const STATUS_COLORS = {
  pending:   "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-400 border-red-200",
};

const STATUS_LABELS = {
  pending:   "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export default function AdminPage() {
  const [key,      setKey]      = useState("");
  const [authed,   setAuthed]   = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [filter,   setFilter]   = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [search,   setSearch]   = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updating,      setUpdating]      = useState<string | null>(null);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [blockedDates,  setBlockedDates]  = useState<{ date: string; reason: string | null }[]>([]);
  const [blockDate,     setBlockDate]     = useState("");
  const [blockReason,   setBlockReason]   = useState("");
  const [blockLoading,  setBlockLoading]  = useState(false);
  const [showBlocked,   setShowBlocked]   = useState(false);

  const fetchBlockedDates = useCallback(async (secret: string) => {
    const res = await fetch("/api/blocked-dates", { headers: { Authorization: `Bearer ${secret}` } });
    if (res.ok) { const d = await res.json(); setBlockedDates(d.blockedDates ?? []); }
  }, []);

  async function addBlockedDate() {
    if (!blockDate) return;
    setBlockLoading(true);
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
      body: JSON.stringify({ date: blockDate, reason: blockReason }),
    });
    setBlockDate(""); setBlockReason("");
    await fetchBlockedDates(savedKey);
    setBlockLoading(false);
  }

  async function removeBlockedDate(date: string) {
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    await fetch("/api/blocked-dates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
      body: JSON.stringify({ date }),
    });
    await fetchBlockedDates(savedKey);
  }

  const fetchBookings = useCallback(async (secret: string) => {
    setLoading(true);
    const res = await fetch("/api/bookings", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (res.ok) {
      const data = await res.json();
      setBookings(data);
      setAuthed(true);
      fetchBlockedDates(secret);
    } else {
      alert("Wrong password");
    }
    setLoading(false);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!authed) return;
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    const iv = setInterval(() => fetchBookings(savedKey), 60_000);
    return () => clearInterval(iv);
  }, [authed, fetchBookings]);

  // Auto-logout after 8 hours
  useEffect(() => {
    const expiry = sessionStorage.getItem("admin_expiry");
    if (expiry && Date.now() > parseInt(expiry)) {
      sessionStorage.removeItem("admin_key");
      sessionStorage.removeItem("admin_expiry");
    }
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("admin_key", key);
    sessionStorage.setItem("admin_expiry", String(Date.now() + 8 * 60 * 60 * 1000));
    await fetchBookings(key);
  }

  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking?")) return;
    setDeleting(id);
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    await fetch(`/api/bookings/${id}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${savedKey}` },
    });
    setBookings(prev => prev.filter(b => b.id !== id));
    setDeleting(null);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    await fetch(`/api/bookings/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
      body:    JSON.stringify({ status }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking["status"] } : b));
    setUpdating(null);
  }

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !dateFilter || b.date === dateFilter)
    .filter(b => !search || [b.name, b.email, b.phone, b.service_label].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  function exportCSV() {
    const headers = ["Date", "Time", "Name", "Phone", "Email", "Service", "Status", "Notes"];
    const rows = filtered.map(b => [b.date, b.time, b.name, b.phone, b.email, b.service_label, b.status, b.notes ?? ""].map(v => `"${v}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const counts = {
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  // ── Login screen ─────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-3">Yee Eyelashes</p>
            <h1 className="text-[2rem] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-serif)" }}>Admin</h1>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-white border border-neutral-200 px-4 py-3.5 text-[13px] text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-[0.25em] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300"
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F5EF]">

      {/* Header */}
      <div className="bg-[#1C1C1C] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]">Yee Eyelashes</p>
          <span className="text-white/20">|</span>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Bookings</p>
        </div>
        <p className="text-[11px] text-white/30">{bookings.length} total</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10">

        {/* Blocked Dates */}
        <div className="bg-white mb-8">
          <button
            onClick={() => setShowBlocked(p => !p)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <p className="text-[9px] uppercase tracking-[0.35em] text-neutral-400">Blocked Dates</p>
              {blockedDates.length > 0 && (
                <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200">{blockedDates.length} blocked</span>
              )}
            </div>
            <span className="text-neutral-300 text-[11px]">{showBlocked ? "▲" : "▼"}</span>
          </button>

          {showBlocked && (
            <div className="border-t border-neutral-100 px-6 py-5">
              {/* Add new blocked date */}
              <div className="flex gap-3 mb-5">
                <input
                  type="date"
                  value={blockDate}
                  onChange={e => setBlockDate(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                />
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="flex-1 bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  onClick={addBlockedDate}
                  disabled={!blockDate || blockLoading}
                  className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-30"
                >
                  Block Date
                </button>
              </div>

              {/* List of blocked dates */}
              {blockedDates.length === 0 ? (
                <p className="text-[12px] text-neutral-300">No blocked dates.</p>
              ) : (
                <div className="space-y-2">
                  {blockedDates.map(b => (
                    <div key={b.date} className="flex items-center justify-between px-4 py-3 bg-neutral-50 border border-neutral-100">
                      <div>
                        <span className="text-[13px] text-[#1C1C1C]">{b.date}</span>
                        {b.reason && <span className="ml-3 text-[11px] text-neutral-400">{b.reason}</span>}
                      </div>
                      <button
                        onClick={() => removeBlockedDate(b.date)}
                        className="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 text-red-400 border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["pending", "confirmed", "cancelled"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? "all" : s)}
              className={`bg-white px-6 py-5 text-left border-b-2 transition-all duration-200 ${filter === s ? "border-[#C9A84C]" : "border-transparent"}`}
            >
              <p className="text-[9.5px] uppercase tracking-[0.35em] text-neutral-400 mb-1">{STATUS_LABELS[s]}</p>
              <p className="text-[2rem] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-serif)" }}>{counts[s]}</p>
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or service…"
            className="flex-1 bg-white border border-neutral-200 px-4 py-3 text-[13px] text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-white border border-neutral-200 px-4 py-3 text-[13px] text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter("")} className="px-4 py-3 text-[11px] text-neutral-400 border border-neutral-200 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
              Clear
            </button>
          )}
          <button onClick={exportCSV} className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all whitespace-nowrap">
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100">
                {["Date & Time", "Client", "Service", "Contact", "Notes", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-4 text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-[13px] text-neutral-300">
                    No bookings found
                  </td>
                </tr>
              )}
              {filtered.map(b => (
                <tr key={b.id} className="border-b border-neutral-50 hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[13px] text-[#1C1C1C] font-medium">{b.date}</p>
                    <p className="text-[11px] text-neutral-400">{b.time}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px] text-[#1C1C1C]">{b.name}</p>
                    <p className="text-[11px] text-neutral-400 text-[9px]">
                      {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </td>
                  <td className="px-5 py-4 max-w-[180px]">
                    <p className="text-[12px] text-[#1C1C1C] leading-snug">{b.service_label}</p>
                  </td>
                  <td className="px-5 py-4">
                    <a href={`tel:${b.phone}`} className="text-[12px] text-[#C9A84C] hover:underline block">{b.phone}</a>
                    <a href={`mailto:${b.email}`} className="text-[11px] text-neutral-400 hover:underline block truncate max-w-[160px]">{b.email}</a>
                  </td>
                  <td className="px-5 py-4 max-w-[160px]">
                    <p className="text-[11px] text-neutral-400 leading-snug">{b.notes ?? "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {b.status !== "confirmed" && (
                        <button
                          onClick={() => updateStatus(b.id, "confirmed")}
                          disabled={updating === b.id}
                          className="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => updateStatus(b.id, "cancelled")}
                          disabled={updating === b.id}
                          className="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 bg-red-50 text-red-400 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => deleteBooking(b.id)}
                        disabled={deleting === b.id}
                        className="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 bg-neutral-100 text-neutral-400 border border-neutral-200 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                      >
                        {deleting === b.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

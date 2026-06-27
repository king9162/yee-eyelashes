"use client";

import { useState, useEffect } from "react";

type BlockedDate = { date: string; reason?: string };

export default function BlockedDatesView({ adminKey }: { adminKey: string }) {
  const [dates,   setDates]   = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [reason,  setReason]  = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch("/api/blocked-dates")
      .then(r => r.json())
      .then(d => { setDates(d.blockedDates ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function addDate() {
    if (!newDate) return;
    setSaving(true);
    const res = await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ date: newDate, reason: reason || null }),
    });
    if (res.ok) {
      setDates(prev => [...prev, { date: newDate, reason: reason || undefined }].sort((a,b) => a.date.localeCompare(b.date)));
      setNewDate(""); setReason("");
    }
    setSaving(false);
  }

  async function removeDate(date: string) {
    await fetch("/api/blocked-dates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ date }),
    });
    setDates(prev => prev.filter(d => d.date !== date));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
        <h2 className="text-[15px] font-semibold text-[#1C1C1C]">Blocked Dates</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Add form */}
        <div className="bg-white border-b border-neutral-100 px-6 py-5">
          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-3">Block a Date</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="border border-neutral-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C] transition-colors" />
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="flex-1 border border-neutral-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C] transition-colors" />
            <button onClick={addDate} disabled={!newDate || saving}
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#1C1C1C] text-white hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40 whitespace-nowrap">
              {saving ? "…" : "Block Date"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white">
          {loading && <p className="px-6 py-8 text-[13px] text-neutral-400">Loading…</p>}
          {!loading && dates.length === 0 && (
            <p className="px-6 py-16 text-center text-[13px] text-neutral-300">No blocked dates</p>
          )}
          {dates.map(d => (
            <div key={d.date} className="flex items-center justify-between px-6 py-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
              <div>
                <p className="text-[14px] font-medium text-[#1C1C1C]">{d.date}</p>
                {d.reason && <p className="text-[12px] text-neutral-400 mt-0.5">{d.reason}</p>}
              </div>
              <button onClick={() => removeDate(d.date)}
                className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

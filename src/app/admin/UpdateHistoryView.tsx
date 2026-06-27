"use client";
import { useState, useEffect } from "react";

type LogEntry = { ts: string; type: "booking" | "client"; name: string; sub: string };

export default function UpdateHistoryView({ adminKey }: { adminKey: string }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sync-log", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then(r => r.json())
      .then(d => { setEntries(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [adminKey]);

  async function clearHistory() {
    if (!confirm("Clear all update history?")) return;
    setClearing(true);
    await fetch("/api/admin/sync-log", { method: "DELETE", headers: { Authorization: `Bearer ${adminKey}` } });
    setEntries([]);
    setClearing(false);
  }

  const fmtTs = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: "America/New_York",
    });
  };

  const byDate = entries.reduce((acc, e) => {
    const day = new Date(e.ts).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const days = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-50">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#1C1C1C]">Update History</h2>
          <p className="text-[13px] text-neutral-400 mt-0.5">只記錄從現在起新增的資料</p>
        </div>
        {entries.length > 0 && (
          <button onClick={clearHistory} disabled={clearing}
            className="shrink-0 text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 border border-neutral-200 hover:border-red-300 hover:text-red-500 text-neutral-400 transition-colors disabled:opacity-40">
            {clearing ? "…" : "Clear All"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-5 py-10 text-[13px] text-neutral-400">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-5 py-12 text-center">
          <p className="text-[15px] text-neutral-300 mb-1">還沒有紀錄</p>
          <p className="text-[12px] text-neutral-300">下次 Square 有新預約進來就會出現在這裡</p>
        </div>
      ) : (
        <div className="space-y-5">
          {days.map(day => (
            <div key={day}>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2 px-1">
                {new Date(day + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-50">
                {byDate[day].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${e.type === "booking" ? "bg-green-400" : "bg-[#C9A84C]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{e.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{e.sub}</p>
                    </div>
                    <span className="text-[11px] text-neutral-300 shrink-0 tabular-nums whitespace-nowrap">{fmtTs(e.ts)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

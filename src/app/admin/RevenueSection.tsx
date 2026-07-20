"use client";
import { useState, useEffect, useCallback } from "react";
import { todayNY } from "@/lib/date";

type Entry = {
  id: string;
  date: string;
  client_name: string;
  service_label: string;
  amount: number;
  tip: number;
  payment_method: string;
  square_payment_id?: string | null;
  notes?: string | null;
};

type DayGroup = { date: string; entries: Entry[] };

const METHOD_LABEL: Record<string, string> = {
  cash:   "💵",
  card:   "💳",
  square: "⬛",
  venmo:  "💙",
  zelle:  "💛",
  other:  "•",
};

const fmt$ = (n: number) => `$${n.toFixed(0)}`;

const EMPTY_FORM = { client_name: "", service_label: "", amount: "", tip: "", payment_method: "cash", notes: "" };

export default function RevenueSection({ adminKey }: { adminKey: string }) {
  const [entries,   setEntries]   = useState<Entry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [openDays,  setOpenDays]  = useState<Set<string>>(new Set([todayNY()]));
  const [addingFor, setAddingFor] = useState<string | null>(null); // date string
  const [addForm,   setAddForm]   = useState(EMPTY_FORM);
  const [addDate,   setAddDate]   = useState(todayNY());
  const [saving,    setSaving]    = useState(false);
  const [syncing,   setSyncing]   = useState(false);
  const [syncMsg,   setSyncMsg]   = useState("");
  const [editId,    setEditId]    = useState<string | null>(null);
  const [editForm,  setEditForm]  = useState(EMPTY_FORM);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);

  const h = { Authorization: `Bearer ${adminKey}` };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/revenue?days=60", { headers: h });
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  // Group by date, newest first
  const groups: DayGroup[] = (() => {
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, ents]) => ({ date, entries: ents }));
  })();

  function toggleDay(date: string) {
    setOpenDays(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  }

  function fmtDate(d: string) {
    const dt = new Date(d + "T12:00:00");
    const today = todayNY();
    if (d === today) return "TODAY";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d === yesterday.toLocaleDateString("en-CA")) return "YESTERDAY";
    return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }

  async function submitAdd(date: string) {
    if (!addForm.client_name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/revenue", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...addForm, amount: parseFloat(addForm.amount) || 0, tip: parseFloat(addForm.tip) || 0 }),
    });
    if (res.ok) { await load(); setAddingFor(null); setAddForm(EMPTY_FORM); }
    setSaving(false);
  }

  async function submitAddNew() {
    if (!addForm.client_name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/revenue", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ date: addDate, ...addForm, amount: parseFloat(addForm.amount) || 0, tip: parseFloat(addForm.tip) || 0 }),
    });
    if (res.ok) {
      await load();
      setShowAddNew(false);
      setAddForm(EMPTY_FORM);
      setOpenDays(prev => new Set([...prev, addDate]));
    }
    setSaving(false);
  }

  async function submitEdit(id: string) {
    setSaving(true);
    await fetch(`/api/admin/revenue/${id}`, {
      method: "PATCH",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, amount: parseFloat(editForm.amount) || 0, tip: parseFloat(editForm.tip) || 0 }),
    });
    await load();
    setEditId(null);
    setSaving(false);
  }

  async function deleteEntry(id: string) {
    setDeleting(id);
    await fetch(`/api/admin/revenue/${id}`, { method: "DELETE", headers: h });
    setEntries(prev => prev.filter(e => e.id !== id));
    setDeleting(null);
  }

  async function syncSquare() {
    setSyncing(true);
    setSyncMsg("");
    const res  = await fetch("/api/admin/revenue/sync-square", { method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ days: 30 }) });
    const data = await res.json();
    setSyncMsg(`Synced ${data.synced ?? 0} new · ${data.skipped ?? 0} skipped`);
    await load();
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 4000);
  }

  // Grand totals
  const totalRevenue = entries.reduce((s, e) => s + e.amount, 0);
  const totalTips    = entries.reduce((s, e) => s + e.tip,    0);

  const AddEntryForm = ({ date, onClose }: { date: string; onClose: () => void }) => (
    <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <input value={addForm.client_name} onChange={e => setAddForm(p => ({ ...p, client_name: e.target.value }))}
            placeholder="Client name *" autoFocus
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
        </div>
        <div className="col-span-2">
          <input value={addForm.service_label} onChange={e => setAddForm(p => ({ ...p, service_label: e.target.value }))}
            placeholder="Service (e.g. New Set 120pcs)"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
        </div>
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
            <input value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="Amount" type="number" min="0" step="5"
              className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
        </div>
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">tip $</span>
            <input value={addForm.tip} onChange={e => setAddForm(p => ({ ...p, tip: e.target.value }))}
              placeholder="0" type="number" min="0" step="1"
              className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
        </div>
        <div className="col-span-2">
          <div className="flex gap-2 flex-wrap">
            {(["cash","card","square","venmo","zelle"] as const).map(m => (
              <button key={m} onClick={() => setAddForm(p => ({ ...p, payment_method: m }))}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${addForm.payment_method === m ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                {METHOD_LABEL[m]} {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">Cancel</button>
        <button onClick={() => submitAdd(date)} disabled={saving || !addForm.client_name.trim()}
          className="px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[#1C1C1C]">Revenue</h3>
          {!loading && entries.length > 0 && (
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Last 60 days · <span className="text-[#1C1C1C] font-semibold">{fmt$(totalRevenue)}</span> service + <span className="text-[#C9A84C] font-semibold">{fmt$(totalTips)}</span> tips = <span className="font-bold text-[#1C1C1C]">{fmt$(totalRevenue + totalTips)}</span> total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {syncMsg && <span className="text-[11px] text-green-600">{syncMsg}</span>}
          <button onClick={syncSquare} disabled={syncing}
            className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 text-[12px] font-semibold text-neutral-500 rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all disabled:opacity-40">
            <svg className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            {syncing ? "Syncing…" : "Sync Square"}
          </button>
          <button onClick={() => { setShowAddNew(true); setAddForm(EMPTY_FORM); setAddDate(todayNY()); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            <span className="text-[16px] leading-none font-light">+</span> Add
          </button>
        </div>
      </div>

      {/* Add New Entry modal */}
      {showAddNew && (
        <div className="mb-4 bg-white border border-[#C9A84C]/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-bold text-[#1C1C1C]">Add Revenue Entry</h4>
            <button onClick={() => setShowAddNew(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Date</label>
              <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <input value={addForm.client_name} onChange={e => setAddForm(p => ({ ...p, client_name: e.target.value }))}
              placeholder="Client name *" autoFocus
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            <input value={addForm.service_label} onChange={e => setAddForm(p => ({ ...p, service_label: e.target.value }))}
              placeholder="Service (e.g. New Set 120pcs)"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                <input value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="Amount" type="number" min="0" step="5"
                  className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">tip $</span>
                <input value={addForm.tip} onChange={e => setAddForm(p => ({ ...p, tip: e.target.value }))}
                  placeholder="0" type="number" min="0" step="1"
                  className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["cash","card","square","venmo","zelle"] as const).map(m => (
                <button key={m} onClick={() => setAddForm(p => ({ ...p, payment_method: m }))}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${addForm.payment_method === m ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                  {METHOD_LABEL[m]} {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowAddNew(false)} className="px-3 py-1.5 text-[12px] text-neutral-400">Cancel</button>
              <button onClick={submitAddNew} disabled={saving || !addForm.client_name.trim()}
                className="px-5 py-2 bg-[#1C1C1C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                {saving ? "Saving…" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day groups */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-5 py-8 text-[13px] text-neutral-400">Loading…</div>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-5 py-10 text-center">
          <p className="text-[14px] text-neutral-300">No revenue entries yet</p>
          <p className="text-[12px] text-neutral-300 mt-1">Click "Add" to record a payment, or "Sync Square" to import</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(({ date, entries: dayEntries }) => {
            const isOpen      = openDays.has(date);
            const dayService  = dayEntries.reduce((s, e) => s + e.amount, 0);
            const dayTips     = dayEntries.reduce((s, e) => s + e.tip,    0);
            const dayTotal    = dayService + dayTips;
            const isToday     = date === todayNY();

            return (
              <div key={date} className={`bg-white rounded-xl border overflow-hidden ${isToday ? "border-[#C9A84C]/40" : "border-neutral-200"}`}>
                {/* Day header */}
                <button onClick={() => toggleDay(date)}
                  className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-neutral-50 transition-colors">
                  <span className={`text-[11px] font-bold tracking-[0.06em] shrink-0 ${isToday ? "text-[#C9A84C]" : "text-neutral-500"}`}>
                    {fmtDate(date)}
                  </span>
                  <span className="flex-1" />
                  {/* Totals */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[14px] font-bold text-[#1C1C1C]">{fmt$(dayService)}</span>
                    {dayTips > 0 && (
                      <span className="text-[12px] text-[#C9A84C] font-semibold">+{fmt$(dayTips)} tip</span>
                    )}
                    <span className="text-[12px] text-neutral-400">= {fmt$(dayTotal)}</span>
                    <span className="text-[11px] text-neutral-300">{dayEntries.length}명</span>
                    <span className={`text-neutral-400 text-[14px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                  </div>
                </button>

                {/* Entries */}
                {isOpen && (
                  <div className="border-t border-neutral-100">
                    {dayEntries.map((e) => (
                      <div key={e.id} className="px-5 py-3 border-b border-neutral-50 last:border-b-0">
                        {editId === e.id ? (
                          /* Edit form */
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editForm.client_name} onChange={ev => setEditForm(p => ({ ...p, client_name: ev.target.value }))}
                                placeholder="Client name" className="col-span-2 border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                              <input value={editForm.service_label} onChange={ev => setEditForm(p => ({ ...p, service_label: ev.target.value }))}
                                placeholder="Service" className="col-span-2 border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">$</span>
                                <input value={editForm.amount} onChange={ev => setEditForm(p => ({ ...p, amount: ev.target.value }))} type="number" min="0"
                                  className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[12px]">tip $</span>
                                <input value={editForm.tip} onChange={ev => setEditForm(p => ({ ...p, tip: ev.target.value }))} type="number" min="0"
                                  className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {(["cash","card","square","venmo","zelle"] as const).map(m => (
                                <button key={m} onClick={() => setEditForm(p => ({ ...p, payment_method: m }))}
                                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all ${editForm.payment_method === m ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "border-neutral-200 text-neutral-400"}`}>
                                  {METHOD_LABEL[m]} {m}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditId(null)} className="text-[12px] text-neutral-400 px-2 py-1">Cancel</button>
                              <button onClick={() => submitEdit(e.id)} disabled={saving}
                                className="px-3 py-1 bg-[#1C1C1C] text-white text-[12px] rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                                {saving ? "…" : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Row view */
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] shrink-0" title={e.payment_method}>{METHOD_LABEL[e.payment_method] ?? "•"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{e.client_name}</p>
                              {e.service_label && <p className="text-[11px] text-neutral-400 truncate">{e.service_label}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[14px] font-bold text-[#1C1C1C]">{fmt$(e.amount)}</p>
                              {e.tip > 0 && <p className="text-[11px] text-[#C9A84C]">+{fmt$(e.tip)} tip</p>}
                            </div>
                            <div className="flex gap-1 shrink-0 ml-1">
                              <button onClick={() => { setEditId(e.id); setEditForm({ client_name: e.client_name, service_label: e.service_label, amount: String(e.amount), tip: String(e.tip), payment_method: e.payment_method, notes: e.notes ?? "" }); }}
                                className="text-[11px] text-neutral-300 hover:text-neutral-600 px-1.5 py-1 transition-colors">Edit</button>
                              <button onClick={() => deleteEntry(e.id)} disabled={deleting === e.id}
                                className="text-[11px] text-neutral-300 hover:text-red-400 px-1.5 py-1 transition-colors">
                                {deleting === e.id ? "…" : "✕"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add entry inline */}
                    {addingFor === date ? (
                      <div className="px-5 pb-4 pt-2">
                        <AddEntryForm date={date} onClose={() => { setAddingFor(null); setAddForm(EMPTY_FORM); }} />
                      </div>
                    ) : (
                      <button onClick={() => { setAddingFor(date); setAddForm(EMPTY_FORM); }}
                        className="w-full px-5 py-2.5 text-[12px] text-neutral-400 hover:text-[#C9A84C] text-left hover:bg-neutral-50 transition-colors border-t border-neutral-50">
                        + Add entry for this day
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

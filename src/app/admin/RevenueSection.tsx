"use client";
import { useState, useEffect, useCallback } from "react";
import { todayNY } from "@/lib/date";

type Entry = {
  id: string; date: string; client_name: string; service_label: string;
  amount: number; tip: number; payment_method: string;
  square_payment_id?: string | null; notes?: string | null;
};
type DayGroup   = { date: string; entries: Entry[] };
type MonthGroup = { key: string; label: string; days: DayGroup[] };

const METHOD_ICON: Record<string, string> = {
  cash: "💵", card: "💳", zelle: "💛", square: "⬛", venmo: "💙", other: "•",
};
const fmt$ = (n: number) => `$${n.toFixed(0)}`;
const EMPTY_FORM = { client_name: "", service_label: "", amount: "", tip: "", payment_method: "cash", notes: "" };
const METHODS = ["zelle","cash","card"] as const;

function todayMinus(n: number): string {
  const d = new Date(todayNY());
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA");
}

function fmtDayLabel(d: string): string {
  const today = todayNY();
  if (d === today) return "TODAY";
  if (d === todayMinus(1)) return "YESTERDAY";
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
}

function monthKey(d: string) { return d.slice(0, 7); } // "2026-07"
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(`${key}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── Inline add form ────────────────────────────────────────────
function AddForm({ onSave, onCancel, saving, form, setForm }: {
  onSave: () => void; onCancel: () => void; saving: boolean;
  form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void;
}) {
  return (
    <div className="space-y-2.5 pt-1">
      <input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })}
        placeholder="Client name *" autoFocus
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
      <input value={form.service_label} onChange={e => setForm({ ...form, service_label: e.target.value })}
        placeholder="Service (e.g. New Set 120pcs)"
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
          <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="0" type="number" min="0" step="5"
            className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">tip $</span>
          <input value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value })}
            placeholder="0" type="number" min="0" step="1"
            className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {METHODS.map(m => (
          <button key={m} onClick={() => setForm({ ...form, payment_method: m })}
            className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all ${form.payment_method === m ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
            {METHOD_ICON[m]} {m}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-end pt-0.5">
        <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.client_name.trim()}
          className="px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </div>
  );
}

// ── Entry row ──────────────────────────────────────────────────
function EntryRow({ e, onEdit, onDelete, deleting }: {
  e: Entry; onEdit: (e: Entry) => void; onDelete: (id: string) => void; deleting: string | null;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-50 last:border-b-0 hover:bg-neutral-50/50 transition-colors">
      <span className="text-[14px] shrink-0" title={e.payment_method}>{METHOD_ICON[e.payment_method] ?? "•"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{e.client_name}</p>
        {e.service_label && <p className="text-[11px] text-neutral-400 truncate">{e.service_label}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-bold text-[#1C1C1C]">{fmt$(e.amount)}</p>
        {e.tip > 0 && <p className="text-[11px] text-[#C9A84C]">+{fmt$(e.tip)} tip</p>}
      </div>
      <div className="flex gap-0.5 shrink-0 ml-1">
        <button onClick={() => onEdit(e)} className="text-[11px] text-neutral-300 hover:text-neutral-600 px-1.5 py-1 transition-colors">Edit</button>
        <button onClick={() => onDelete(e.id)} disabled={deleting === e.id}
          className="text-[11px] text-neutral-300 hover:text-red-400 px-1.5 py-1 transition-colors">
          {deleting === e.id ? "…" : "✕"}
        </button>
      </div>
    </div>
  );
}

// ── Day card ───────────────────────────────────────────────────
function DayCard({ day, isOpen, onToggle, onAddEntry, adminKey, onRefresh, defaultOpen }: {
  day: DayGroup; isOpen: boolean; onToggle: () => void;
  onAddEntry: () => void; adminKey: string; onRefresh: () => void; defaultOpen?: boolean;
}) {
  const [addingHere, setAddingHere] = useState(false);
  const [addForm, setAddForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const h = { Authorization: `Bearer ${adminKey}` };

  const dayService = day.entries.reduce((s, e) => s + e.amount, 0);
  const dayTips    = day.entries.reduce((s, e) => s + e.tip, 0);
  const isToday    = day.date === todayNY();

  async function saveAdd() {
    setSaving(true);
    const res = await fetch("/api/admin/revenue", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ date: day.date, ...addForm, amount: parseFloat(addForm.amount) || 0, tip: parseFloat(addForm.tip) || 0 }),
    });
    if (res.ok) { await onRefresh(); setAddingHere(false); setAddForm(EMPTY_FORM); }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/admin/revenue/${id}`, {
      method: "PATCH",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, amount: parseFloat(editForm.amount) || 0, tip: parseFloat(editForm.tip) || 0 }),
    });
    await onRefresh();
    setEditId(null);
    setSaving(false);
  }

  async function deleteEntry(id: string) {
    setDeleting(id);
    await fetch(`/api/admin/revenue/${id}`, { method: "DELETE", headers: h });
    await onRefresh();
    setDeleting(null);
  }

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${isToday ? "border-[#C9A84C]/50" : "border-neutral-200"}`}>
      {/* Header */}
      <button onClick={onToggle} className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-neutral-50/50 transition-colors">
        <span className={`text-[11px] font-bold tracking-[0.06em] shrink-0 ${isToday ? "text-[#C9A84C]" : "text-neutral-500"}`}>
          {fmtDayLabel(day.date)}
        </span>
        <span className="flex-1" />
        <div className="flex items-center gap-2 shrink-0">
          <span className="min-w-[52px] text-right tabular-nums text-[14px] font-bold text-[#1C1C1C]">{fmt$(dayService)}</span>
          <span className="min-w-[76px] text-right tabular-nums text-[12px] text-[#C9A84C] font-semibold">{dayTips > 0 ? `+${fmt$(dayTips)} tip` : ""}</span>
          <span className="min-w-[60px] text-right tabular-nums text-[12px] text-neutral-400">= {fmt$(dayService + dayTips)}</span>
          <span className="w-4 text-right text-[11px] text-neutral-300">{day.entries.length}</span>
          <span className={`text-neutral-400 text-[14px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>⌄</span>
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-neutral-100">
          {day.entries.map(e => (
            editId === e.id ? (
              <div key={e.id} className="px-5 py-3 border-b border-neutral-50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={editForm.client_name} onChange={ev => setEditForm(p => ({ ...p, client_name: ev.target.value }))}
                    className="col-span-2 border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                  <input value={editForm.service_label} onChange={ev => setEditForm(p => ({ ...p, service_label: ev.target.value }))}
                    placeholder="Service" className="col-span-2 border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">$</span>
                    <input value={editForm.amount} onChange={ev => setEditForm(p => ({ ...p, amount: ev.target.value }))} type="number" min="0"
                      className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" /></div>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[12px]">tip $</span>
                    <input value={editForm.tip} onChange={ev => setEditForm(p => ({ ...p, tip: ev.target.value }))} type="number" min="0"
                      className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" /></div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {METHODS.map(m => (
                    <button key={m} onClick={() => setEditForm(p => ({ ...p, payment_method: m }))}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all ${editForm.payment_method === m ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "border-neutral-200 text-neutral-400"}`}>
                      {METHOD_ICON[m]} {m}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditId(null)} className="text-[12px] text-neutral-400 px-2 py-1">Cancel</button>
                  <button onClick={() => saveEdit(e.id)} disabled={saving}
                    className="px-3 py-1 bg-[#1C1C1C] text-white text-[12px] rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                    {saving ? "…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <EntryRow key={e.id} e={e} deleting={deleting}
                onEdit={e => { setEditId(e.id); setEditForm({ client_name: e.client_name, service_label: e.service_label, amount: String(e.amount), tip: String(e.tip), payment_method: e.payment_method, notes: e.notes ?? "" }); }}
                onDelete={deleteEntry} />
            )
          ))}

          {/* Inline add */}
          {addingHere ? (
            <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
              <AddForm form={addForm} setForm={setAddForm} saving={saving} onSave={saveAdd}
                onCancel={() => { setAddingHere(false); setAddForm(EMPTY_FORM); }} />
            </div>
          ) : (
            <button onClick={() => setAddingHere(true)}
              className="w-full px-5 py-2.5 text-[12px] text-neutral-400 hover:text-[#C9A84C] text-left hover:bg-neutral-50 transition-colors border-t border-neutral-50">
              + Add entry for this day
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function RevenueSection({ adminKey }: { adminKey: string }) {
  const [entries,    setEntries]    = useState<Entry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [syncMsg,    setSyncMsg]    = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [addForm,    setAddForm]    = useState(EMPTY_FORM);
  const [addDate,    setAddDate]    = useState(todayNY());
  const [saving,     setSaving]     = useState(false);
  // open day cards (default: today + 4 days)
  const [openDays,   setOpenDays]   = useState<Set<string>>(() =>
    new Set([todayNY(), todayMinus(1), todayMinus(2), todayMinus(3), todayMinus(4)])
  );
  // open month groups
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set([monthKey(todayNY())]));
  // open days within a month group
  const [openMonthDays, setOpenMonthDays] = useState<Set<string>>(new Set());

  const h = { Authorization: `Bearer ${adminKey}` };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/revenue", { headers: h });
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  // Group by date
  const dayMap = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!dayMap.has(e.date)) dayMap.set(e.date, []);
    dayMap.get(e.date)!.push(e);
  }
  const allDays: DayGroup[] = Array.from(dayMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, ents]) => ({ date, entries: ents }));

  const REVENUE_START = "2026-07-20"; // only show entries from launch date onwards
  const cutoff     = todayMinus(4);
  const visible    = allDays.filter(d => d.date >= REVENUE_START);
  const recentDays = visible.filter(d => d.date >= cutoff);
  const olderDays  = visible.filter(d => d.date <  cutoff);

  // Group older by month
  const monthMap = new Map<string, DayGroup[]>();
  for (const day of olderDays) {
    const mk = monthKey(day.date);
    if (!monthMap.has(mk)) monthMap.set(mk, []);
    monthMap.get(mk)!.push(day);
  }
  const months: MonthGroup[] = Array.from(monthMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, days]) => ({ key, label: monthLabel(key), days }));

  // Totals (from launch date)
  const visibleEntries = entries.filter(e => e.date >= REVENUE_START);
  const totalService = visibleEntries.reduce((s, e) => s + e.amount, 0);
  const totalTips    = visibleEntries.reduce((s, e) => s + e.tip,    0);

  async function syncSquare() {
    setSyncing(true); setSyncMsg("");
    const res  = await fetch("/api/admin/revenue/sync-square", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({}),
    });
    const data = await res.json();
    setSyncMsg(`Synced ${data.synced ?? 0} new · ${data.skipped ?? 0} already saved`);
    await load();
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 5000);
  }

  async function submitAddNew() {
    if (!addForm.client_name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/revenue", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ date: addDate, ...addForm, amount: parseFloat(addForm.amount) || 0, tip: parseFloat(addForm.tip) || 0 }),
    });
    if (res.ok) {
      await load();
      setShowAddNew(false); setAddForm(EMPTY_FORM);
      setOpenDays(prev => new Set([...prev, addDate]));
    }
    setSaving(false);
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[#1C1C1C]">Revenue</h3>
          {!loading && entries.length > 0 && (
            <p className="text-[11px] text-neutral-400 mt-0.5">
              All time · <span className="font-semibold text-[#1C1C1C]">{fmt$(totalService)}</span> service
              {totalTips > 0 && <> + <span className="text-[#C9A84C] font-semibold">{fmt$(totalTips)}</span> tips</>}
              {" = "}<span className="font-bold text-[#1C1C1C]">{fmt$(totalService + totalTips)}</span> total
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

      {/* Manual add modal */}
      {showAddNew && (
        <div className="mb-4 bg-white border border-[#C9A84C]/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-bold text-[#1C1C1C]">Add Revenue Entry</h4>
            <button onClick={() => setShowAddNew(false)} className="text-neutral-400 hover:text-neutral-700 text-lg">✕</button>
          </div>
          <div className="mb-3">
            <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Date</label>
            <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
          <AddForm form={addForm} setForm={setAddForm} saving={saving} onSave={submitAddNew}
            onCancel={() => setShowAddNew(false)} />
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-5 py-8 text-[13px] text-neutral-400">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-5 py-10 text-center">
          <p className="text-[14px] text-neutral-300">No revenue entries yet</p>
          <p className="text-[12px] text-neutral-300 mt-1">Click "Sync Square" to import payments, or "+ Add" for cash entries</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* ── Recent 5 days ── */}
          {recentDays.length > 0 && (
            <>
              {recentDays.map(day => (
                <DayCard key={day.date} day={day} adminKey={adminKey} onRefresh={load}
                  isOpen={openDays.has(day.date)}
                  onToggle={() => setOpenDays(prev => { const n = new Set(prev); n.has(day.date) ? n.delete(day.date) : n.add(day.date); return n; })}
                  onAddEntry={() => {}} />
              ))}
            </>
          )}

          {/* ── Monthly groups ── */}
          {months.map(month => {
            const mService = month.days.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + e.amount, 0), 0);
            const mTips    = month.days.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + e.tip,    0), 0);
            const mCount   = month.days.reduce((s, d) => s + d.entries.length, 0);
            const isOpen   = openMonths.has(month.key);

            return (
              <div key={month.key} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {/* Month header */}
                <button onClick={() => setOpenMonths(prev => { const n = new Set(prev); n.has(month.key) ? n.delete(month.key) : n.add(month.key); return n; })}
                  className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-neutral-50/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#1C1C1C]">{month.label}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{mCount} entries · {month.days.length} days</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="min-w-[52px] text-right tabular-nums text-[15px] font-bold text-[#1C1C1C]">{fmt$(mService)}</span>
                    <span className="min-w-[76px] text-right tabular-nums text-[12px] text-[#C9A84C] font-semibold">{mTips > 0 ? `+${fmt$(mTips)} tip` : ""}</span>
                    <span className="min-w-[60px] text-right tabular-nums text-[13px] font-bold text-neutral-500">= {fmt$(mService + mTips)}</span>
                    <span className={`text-neutral-400 text-[14px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                  </div>
                </button>

                {/* Days within month */}
                {isOpen && (
                  <div className="border-t border-neutral-100 divide-y divide-neutral-50">
                    {month.days.map(day => {
                      const dk      = `${month.key}:${day.date}`;
                      const isDOpen = openMonthDays.has(dk);
                      const dSvc    = day.entries.reduce((s, e) => s + e.amount, 0);
                      const dTip    = day.entries.reduce((s, e) => s + e.tip,    0);
                      return (
                        <div key={day.date}>
                          <button onClick={() => setOpenMonthDays(prev => { const n = new Set(prev); n.has(dk) ? n.delete(dk) : n.add(dk); return n; })}
                            className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-neutral-50/50 transition-colors">
                            <span className="text-[12px] font-semibold text-neutral-500 shrink-0">
                              {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <span className="flex-1" />
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="min-w-[52px] text-right tabular-nums text-[13px] font-bold text-[#1C1C1C]">{fmt$(dSvc)}</span>
                              <span className="min-w-[76px] text-right tabular-nums text-[11px] text-[#C9A84C]">{dTip > 0 ? `+${fmt$(dTip)} tip` : ""}</span>
                              <span className="w-4 text-right text-[11px] text-neutral-300">{day.entries.length}</span>
                              <span className={`text-neutral-400 text-[13px] transition-transform duration-200 ${isDOpen ? "rotate-180" : ""}`}>⌄</span>
                            </div>
                          </button>
                          {isDOpen && (
                            <div className="bg-neutral-50/50">
                              <DayCard day={day} adminKey={adminKey} onRefresh={load}
                                isOpen={true} onToggle={() => {}} onAddEntry={() => {}} />
                            </div>
                          )}
                        </div>
                      );
                    })}
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

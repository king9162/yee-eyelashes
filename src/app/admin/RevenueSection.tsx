"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { todayNY } from "@/lib/date";

type Entry = {
  id: string; date: string; client_name: string; service_label: string;
  amount: number; tip: number; payment_method: string;
  square_payment_id?: string | null; notes?: string | null; recorded_by?: string | null;
};
type DayGroup   = { date: string; entries: Entry[] };
type MonthGroup = { key: string; label: string; days: DayGroup[] };

const METHOD_ICON: Record<string, string> = {
  cash: "💵", card: "💳", zelle: "💛", package: "3×", gp: "🟢", square: "⬛", venmo: "💙", other: "•",
};
const METHOD_LABEL: Record<string, string> = {
  cash: "Cash", card: "Card", zelle: "Zelle", package: "Package", gp: "Groupon", square: "Square", venmo: "Venmo", other: "",
};
const fmt$ = (n: number) => `$${n.toFixed(0)}`;
const METHODS = ["zelle","cash","card","package","gp"] as const;

// Parse any time string ("9:30 AM", "09:30", "14:00") → total minutes from midnight
function parseTimeMins(t: string): number {
  if (!t) return 0;
  const up = t.trim().toUpperCase();
  const isPM = up.includes("PM");
  const isAM = up.includes("AM");
  const clean = up.replace(/\s*(AM|PM)/g, "").trim();
  const [hRaw, mRaw] = clean.split(":").map(Number);
  const h = isNaN(hRaw) ? 0 : hRaw;
  const m = isNaN(mRaw) ? 0 : mRaw;
  let hours = h;
  if ((isPM || (!isAM && h < 8)) && h !== 12) hours += 12; // treat bare <8 as PM
  if (isAM && h === 12) hours = 0;
  return hours * 60 + m;
}

function minsToStr(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m   = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12  = h24 % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function fmtTimeRange(time: string, durationMin: number): string {
  const start = parseTimeMins(time);
  return `${minsToStr(start)} – ${minsToStr(start + durationMin)}`;
}

// "cash:60,card:19" → [{method:"cash",amount:60},{method:"card",amount:19}]
// "cash" → null (single method)
type Split = { method: string; amount: number };
function parseSplits(pm: string): Split[] | null {
  if (!pm || !pm.includes(":")) return null;
  return pm.split(",").map(p => {
    const i = p.indexOf(":");
    return { method: p.slice(0, i).trim(), amount: parseFloat(p.slice(i + 1)) || 0 };
  });
}

function fmtMethod(pm: string): string {
  const splits = parseSplits(pm);
  if (splits) return splits.map(s => `${METHOD_LABEL[s.method] ?? s.method} $${s.amount}`).join(" + ");
  return METHOD_LABEL[pm] ?? pm;
}

const EMPTY_FORM = {
  client_name: "", service_label: "",
  amount: "", tip: "", notes: "",
  pay_methods: ["cash"] as string[],
  pay_amounts: {} as Record<string, string>,
};
type FormState = typeof EMPTY_FORM;

function buildPayment(form: FormState): { payment_method: string; amount: number } {
  const upgrade = parseFloat(form.notes) || 0;
  if (form.pay_methods.length <= 1) {
    return {
      payment_method: form.pay_methods[0] ?? "cash",
      amount: (parseFloat(form.amount) || 0) + upgrade,
    };
  }
  const parts = form.pay_methods.map(m => `${m}:${parseFloat(form.pay_amounts[m] || "0")}`);
  const total = form.pay_methods.reduce((s, m) => s + (parseFloat(form.pay_amounts[m]) || 0), 0) + upgrade;
  return { payment_method: parts.join(","), amount: total };
}

function formFromEntry(e: Entry): FormState {
  const splits = parseSplits(e.payment_method);
  if (splits) {
    const pay_amounts: Record<string, string> = {};
    for (const s of splits) pay_amounts[s.method] = String(s.amount);
    return {
      client_name: e.client_name, service_label: e.service_label,
      amount: "", tip: String(e.tip), notes: "",
      pay_methods: splits.map(s => s.method),
      pay_amounts,
    };
  }
  return {
    client_name: e.client_name, service_label: e.service_label,
    amount: String(e.amount), tip: String(e.tip), notes: "",
    pay_methods: [e.payment_method || "cash"],
    pay_amounts: {},
  };
}

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

function monthKey(d: string) { return d.slice(0, 7); }
function monthLabel(key: string) {
  return new Date(`${key}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── Payment sub-form (multi-select methods + per-method amounts) ──────────
function PaymentForm({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const isMulti = form.pay_methods.length > 1;

  function toggleMethod(m: string) {
    const active = form.pay_methods.includes(m);
    let methods: string[];
    if (active) {
      if (form.pay_methods.length <= 1) return;
      methods = form.pay_methods.filter(x => x !== m);
    } else {
      methods = [...form.pay_methods, m];
    }
    const pay_amounts = { ...form.pay_amounts };
    if (!isMulti && methods.length > 1) {
      pay_amounts[form.pay_methods[0]] = form.amount;
    }
    setForm({ ...form, pay_methods: methods, pay_amounts });
  }

  return (
    <div className="space-y-2">
      {isMulti ? (
        <div className="space-y-1.5">
          {form.pay_methods.map(m => (
            <div key={m} className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-500 w-[76px] shrink-0 truncate">
                {METHOD_ICON[m]} {METHOD_LABEL[m] ?? m}
              </span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                <input
                  value={form.pay_amounts[m] ?? ""}
                  onChange={ev => setForm({ ...form, pay_amounts: { ...form.pay_amounts, [m]: ev.target.value } })}
                  placeholder="0" type="number" min="0" step="1"
                  className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">tip $</span>
              <input value={form.tip} onChange={ev => setForm({ ...form, tip: ev.target.value })}
                placeholder="0" type="number" min="0" step="1"
                className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">upgrade $</span>
              <input value={form.notes} onChange={ev => setForm({ ...form, notes: ev.target.value })}
                placeholder="0" type="number" min="0" step="1"
                className="w-full border border-neutral-200 rounded-lg pl-16 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
            <input value={form.amount} onChange={ev => setForm({ ...form, amount: ev.target.value })}
              placeholder="0" type="number" min="0" step="5"
              className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">tip $</span>
            <input value={form.tip} onChange={ev => setForm({ ...form, tip: ev.target.value })}
              placeholder="0" type="number" min="0" step="1"
              className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">upgrade $</span>
            <input value={form.notes} onChange={ev => setForm({ ...form, notes: ev.target.value })}
              placeholder="0" type="number" min="0" step="1"
              className="w-full border border-neutral-200 rounded-lg pl-16 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
          </div>
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {METHODS.map(m => (
          <button key={m} type="button" onClick={() => toggleMethod(m)}
            className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all ${
              form.pay_methods.includes(m)
                ? "bg-[#1C1C1C] text-white border-[#1C1C1C]"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
            }`}>
            {METHOD_ICON[m]} {METHOD_LABEL[m]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Inline add form ────────────────────────────────────────────
function AddForm({ onSave, onCancel, saving, form, setForm }: {
  onSave: () => void; onCancel: () => void; saving: boolean;
  form: FormState; setForm: (f: FormState) => void;
}) {
  return (
    <div className="space-y-2.5 pt-1">
      <input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })}
        placeholder="Client name *" autoFocus
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
      <input value={form.service_label} onChange={e => setForm({ ...form, service_label: e.target.value })}
        placeholder="Service (e.g. New Set 120pcs)"
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
      <PaymentForm form={form} setForm={setForm} />
      <div className="flex gap-2 justify-end pt-0.5">
        <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.client_name.trim()}
          className="px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Entry row — dashboard style ────────────────────────────────
function EntryRow({ e, onEdit, onDelete, deleting, bookingInfo }: {
  e: Entry; onEdit: (e: Entry) => void; onDelete: (id: string) => void; deleting: string | null;
  bookingInfo?: { time: string; duration_min: number };
}) {
  const needsPayment = e.amount === 0 && !e.square_payment_id && e.payment_method !== "gp";
  const splits = parseSplits(e.payment_method);
  const methodIcon  = METHOD_ICON[e.payment_method] ?? "•";
  const methodLabel = METHOD_LABEL[e.payment_method] ?? e.payment_method;

  return (
    <div className={`px-4 sm:px-5 py-4 border-b border-neutral-100 last:border-b-0 transition-colors ${needsPayment ? "bg-amber-50/30" : "hover:bg-neutral-50/40"}`}>
      <div className="flex gap-5 sm:gap-8">

        {/* Desktop-only time column */}
        <div className="hidden sm:block w-[160px] shrink-0 pt-0.5">
          {bookingInfo
            ? <p className="text-[13px] text-neutral-400 leading-snug">{fmtTimeRange(bookingInfo.time, bookingInfo.duration_min)}</p>
            : <p className="text-[12px] text-neutral-200">—</p>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile time — above name */}
          {bookingInfo && (
            <p className="sm:hidden text-[12px] text-neutral-400 mb-1 leading-snug">
              {fmtTimeRange(bookingInfo.time, bookingInfo.duration_min)}
            </p>
          )}

          {/* Name row + actions inline */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-[17px] font-bold text-[#1C1C1C] leading-tight">{e.client_name}</p>
            <div className="flex gap-0.5 shrink-0 -mt-0.5">
              <button onClick={() => onEdit(e)} className="text-[11px] text-neutral-300 hover:text-neutral-600 px-1.5 py-1 transition-colors">Edit</button>
              <button onClick={() => onDelete(e.id)} disabled={deleting === e.id}
                className="text-[11px] text-neutral-300 hover:text-red-400 px-1.5 py-1 transition-colors">
                {deleting === e.id ? "…" : "✕"}
              </button>
            </div>
          </div>

          {e.service_label && (
            <p className="text-[13px] text-neutral-400 mt-0.5">{e.service_label}</p>
          )}

          {needsPayment ? (
            <p className="text-[11px] text-amber-500 font-semibold mt-1.5">⚠ 填入付款方式與金額</p>
          ) : (
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              {e.recorded_by && (
                <span className="text-[12px] font-bold text-[#1C1C1C]">{e.recorded_by}</span>
              )}
              {splits ? (
                splits.map(s => (
                  <span key={s.method} className="flex items-center gap-0.5 text-[12px]">
                    <span>{METHOD_ICON[s.method] ?? "•"}</span>
                    <span className="text-neutral-400 text-[11px]">{METHOD_LABEL[s.method] ?? s.method}</span>
                    <span className="font-semibold text-[#1C1C1C] ml-0.5">${s.amount}</span>
                  </span>
                ))
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px]">{methodIcon}</span>
                  <span className="text-[12px] text-neutral-400">{methodLabel}</span>
                  {e.amount > 0 && <span className="text-[14px] font-bold text-[#1C1C1C] tabular-nums">{fmt$(e.amount)}</span>}
                </span>
              )}
              {e.tip > 0 && <span className="text-[12px] text-[#C9A84C] tabular-nums">+{fmt$(e.tip)} tip</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Day card ───────────────────────────────────────────────────
function DayCard({ day, isOpen, onToggle, onAddEntry, adminKey, onRefresh, noHeader, requestWho, bookingMap }: {
  day: DayGroup; isOpen: boolean; onToggle: () => void;
  onAddEntry: () => void; adminKey: string; onRefresh: () => void; noHeader?: boolean;
  requestWho: () => Promise<string>; bookingMap: Map<string, {time: string; duration_min: number}>;
}) {
  const [addingHere, setAddingHere]           = useState(false);
  const [addForm, setAddForm]                 = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]                   = useState(false);
  const [editId, setEditId]                   = useState<string | null>(null);
  const [editForm, setEditForm]               = useState<FormState>(EMPTY_FORM);
  const [deleting, setDeleting]               = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const h = { Authorization: `Bearer ${adminKey}` };

  const dayService = day.entries.reduce((s, e) => s + e.amount, 0);
  const dayTips    = day.entries.reduce((s, e) => s + e.tip, 0);
  const isToday    = day.date === todayNY();

  async function saveAdd() {
    const who = await requestWho();
    setSaving(true);
    const { payment_method, amount } = buildPayment(addForm);
    const res = await fetch("/api/admin/revenue", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        date: day.date,
        client_name: addForm.client_name,
        service_label: addForm.service_label,
        amount,
        tip: parseFloat(addForm.tip) || 0,
        payment_method,
        notes: null,
        changed_by: who,
      }),
    });
    if (res.ok) { await onRefresh(); setAddingHere(false); setAddForm(EMPTY_FORM); }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    const who = await requestWho();
    setSaving(true);
    const { payment_method, amount } = buildPayment(editForm);
    await fetch(`/api/admin/revenue/${id}`, {
      method: "PATCH",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: editForm.client_name,
        service_label: editForm.service_label,
        amount,
        tip: parseFloat(editForm.tip) || 0,
        payment_method,
        notes: null,
        changed_by: who,
      }),
    });
    await onRefresh();
    setEditId(null);
    setSaving(false);
  }

  async function deleteEntry(id: string) {
    const who = await requestWho();
    setDeleting(id);
    await fetch(`/api/admin/revenue/${id}`, {
      method: "DELETE", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ changed_by: who }),
    });
    await onRefresh();
    setDeleting(null);
  }

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${isToday ? "border-[#C9A84C]/50" : "border-neutral-200"}`}>
      {/* Header */}
      {!noHeader && (
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
      )}

      {/* Expanded content */}
      {(isOpen || noHeader) && (
        <div className="border-t border-neutral-100">
          {[...day.entries].sort((a, b) => {
              const ta = parseTimeMins(bookingMap.get(`${a.date}|${a.client_name}`)?.time ?? "");
              const tb = parseTimeMins(bookingMap.get(`${b.date}|${b.client_name}`)?.time ?? "");
              return (ta || 9999) - (tb || 9999);
            }).map(e => (
            editId === e.id ? (
              <div key={e.id} className="px-5 py-3 border-b border-neutral-50 space-y-2">
                <input value={editForm.client_name} onChange={ev => setEditForm(p => ({ ...p, client_name: ev.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                <input value={editForm.service_label} onChange={ev => setEditForm(p => ({ ...p, service_label: ev.target.value }))}
                  placeholder="Service" className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                <PaymentForm form={editForm} setForm={setEditForm} />
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
                bookingInfo={bookingMap.get(`${e.date}|${e.client_name}`)}
                onEdit={entry => { setEditId(entry.id); setEditForm(formFromEntry(entry)); }}
                onDelete={id => setConfirmDeleteId(id)} />
            )
          ))}

          {/* Delete confirmation */}
          {confirmDeleteId && (() => {
            const entry = day.entries.find(e => e.id === confirmDeleteId);
            return (
              <div className="px-5 py-4 bg-red-50/60 border-t border-red-100 flex items-center justify-between gap-3">
                <p className="text-[13px] text-[#1C1C1C]">
                  確定刪除 <span className="font-bold">{entry?.client_name}</span> 的記錄？
                </p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 text-[12px] text-neutral-500 border border-neutral-200 rounded-lg hover:border-neutral-400">
                    取消
                  </button>
                  <button onClick={() => { const id = confirmDeleteId; setConfirmDeleteId(null); deleteEntry(id); }}
                    disabled={deleting === confirmDeleteId}
                    className="px-3 py-1.5 text-[12px] font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40">
                    {deleting === confirmDeleteId ? "刪除中…" : "確定刪除"}
                  </button>
                </div>
              </div>
            );
          })()}

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
  const [bookingMap, setBookingMap] = useState<Map<string, {time: string; duration_min: number}>>(new Map());
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [syncMsg,    setSyncMsg]    = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [addForm,    setAddForm]    = useState<FormState>(EMPTY_FORM);
  const [addDate,    setAddDate]    = useState(todayNY());
  const [saving,     setSaving]     = useState(false);
  const [openMonths,    setOpenMonths]    = useState<Set<string>>(new Set());
  const [openMonthDays, setOpenMonthDays] = useState<Set<string>>(new Set());

  // PIN modal
  const [pinVisible,  setPinVisible]  = useState(false);
  const [pinInput,    setPinInput]    = useState("");
  const [pinError,    setPinError]    = useState("");
  const [pinLoading,  setPinLoading]  = useState(false);
  const pinResolverRef = useRef<((name: string) => void) | null>(null);

  function requestWho(): Promise<string> {
    return new Promise<string>(resolve => {
      pinResolverRef.current = resolve;
      setPinInput("");
      setPinError("");
      setPinVisible(true);
    });
  }

  async function confirmPin() {
    if (!pinInput.trim()) return;
    setPinLoading(true); setPinError("");
    const res = await fetch("/api/admin/verify-user-pin", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput.trim() }),
    });
    setPinLoading(false);
    if (!res.ok) { setPinError("密碼錯誤，請重試"); return; }
    const { name } = await res.json();
    pinResolverRef.current?.(name);
    pinResolverRef.current = null;
    setPinVisible(false);
    setPinInput("");
  }

  const h = { Authorization: `Bearer ${adminKey}` };

  const load = useCallback(async () => {
    const [revRes, bkgRes] = await Promise.all([
      fetch("/api/admin/revenue", { headers: h }),
      fetch("/api/bookings", { headers: h }),
    ]);
    const data = await revRes.json();
    const bkgs = await bkgRes.json();
    setEntries(Array.isArray(data) ? data : []);
    const map = new Map<string, {time: string; duration_min: number}>();
    for (const b of (Array.isArray(bkgs) ? bkgs : [])) {
      if (b.date && b.name && b.time) map.set(`${b.date}|${b.name}`, { time: b.time, duration_min: b.duration_min ?? 60 });
    }
    setBookingMap(map);
    setLoading(false);
  }, [adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, [load]);

  const REVENUE_START = "2026-07-20";
  const today = todayNY();

  const dayMap = new Map<string, Entry[]>();
  for (const e of entries) {
    if (e.date < REVENUE_START) continue;
    if (!dayMap.has(e.date)) dayMap.set(e.date, []);
    dayMap.get(e.date)!.push(e);
  }

  const monthMap = new Map<string, DayGroup[]>();
  for (const [date, ents] of dayMap.entries()) {
    const mk = monthKey(date);
    if (!monthMap.has(mk)) monthMap.set(mk, []);
    monthMap.get(mk)!.push({ date, entries: ents });
  }
  const months: MonthGroup[] = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, days]) => ({
      key, label: monthLabel(key),
      days: [...days].sort((a, b) => a.date.localeCompare(b.date)),
    }));

  const visibleEntries = entries.filter(e => e.date >= REVENUE_START);
  const totalService = visibleEntries.reduce((s, e) => s + e.amount, 0);
  const totalTips    = visibleEntries.reduce((s, e) => s + e.tip,    0);

  async function syncSquare() {
    setSyncing(true); setSyncMsg("");
    const res  = await fetch("/api/admin/revenue/sync-square", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({}),
    });
    const data = await res.json();
    const parts = [`Synced ${data.synced ?? 0} payments · ${data.bookingsSynced ?? 0} bookings`];
    if ((data.skipped ?? 0) > 0) parts.push(`${data.skipped} already saved`);
    setSyncMsg(parts.join(" · "));
    await load();
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 5000);
  }

  async function submitAddNew() {
    if (!addForm.client_name.trim()) return;
    const who = await requestWho();
    setSaving(true);
    const { payment_method, amount } = buildPayment(addForm);
    const res = await fetch("/api/admin/revenue", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        date: addDate,
        client_name: addForm.client_name,
        service_label: addForm.service_label,
        amount,
        tip: parseFloat(addForm.tip) || 0,
        payment_method,
        notes: null,
        changed_by: who,
      }),
    });
    if (res.ok) {
      await load();
      setShowAddNew(false); setAddForm(EMPTY_FORM);
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

      {/* ── PIN modal ── */}
      {pinVisible && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-72">
            <h4 className="text-[15px] font-bold text-[#1C1C1C] mb-1">輸入你的密碼</h4>
            <p className="text-[12px] text-neutral-400 mb-4">系統會根據密碼自動記錄是誰操作的。</p>
            <input autoFocus value={pinInput} onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && pinInput.trim() && confirmPin()}
              placeholder="密碼" type="password" maxLength={20}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] mb-2" />
            {pinError && <p className="text-[12px] text-red-500 mb-2">{pinError}</p>}
            <button onClick={confirmPin} disabled={!pinInput.trim() || pinLoading}
              className="w-full px-4 py-2 bg-[#1C1C1C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {pinLoading ? "驗證中…" : "確認"}
            </button>
          </div>
        </div>
      )}

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
          {months.map(month => {
            const mService = month.days.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + e.amount, 0), 0);
            const mTips    = month.days.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + e.tip,    0), 0);
            const mCount   = month.days.reduce((s, d) => s + d.entries.length, 0);
            const isOpen   = openMonths.has(month.key);

            return (
              <div key={month.key} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
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

                {isOpen && (
                  <div className="border-t border-neutral-100 divide-y divide-neutral-50">
                    {month.days.map(day => {
                      const dk      = `${month.key}:${day.date}`;
                      const isDOpen = openMonthDays.has(dk);
                      const dSvc    = day.entries.reduce((s, e) => s + e.amount, 0);
                      const dTip    = day.entries.reduce((s, e) => s + e.tip,    0);
                      const isToday = day.date === today;
                      return (
                        <div key={day.date} className={isToday ? "border-l-2 border-[#C9A84C]" : ""}>
                          <button onClick={() => setOpenMonthDays(prev => { const n = new Set(prev); n.has(dk) ? n.delete(dk) : n.add(dk); return n; })}
                            className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-neutral-50/50 transition-colors">
                            <span className={`text-[12px] font-semibold shrink-0 ${isToday ? "text-[#C9A84C]" : "text-neutral-500"}`}>
                              {isToday ? "TODAY · " : ""}{new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
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
                                isOpen={true} onToggle={() => {}} onAddEntry={() => {}} noHeader requestWho={requestWho} bookingMap={bookingMap} />
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

"use client";
import { useState, useEffect, useCallback } from "react";

// ── Category definitions ───────────────────────────────────────
const CATEGORY_GROUPS: { group: string; items: string[] }[] = [
  { group: "Fixed Expenses",           items: ["Rent","Electricity","Water","Internet","Phone","Insurance"] },
  { group: "Marketing",                items: ["Google Ads","Meta Ads","Yelp Ads","Groupon","SEO","Printing / Marketing Materials"] },
  { group: "Software / Subscription",  items: ["Square","Twilio","OpenPhone","Google Workspace","Domain","Vercel","Supabase","Resend","Cloudflare","Canva","ChatGPT","Cursor","Figma"] },
  { group: "Business Operation",       items: ["Office Supplies","Cleaning Supplies","Coffee / Snacks","Salon Supplies","Lash Supplies","PMU Supplies","Disposable Tools","Laundry","Equipment Purchase","Repairs & Maintenance"] },
  { group: "Financial",                items: ["Bank Fees","Credit Card Processing Fees","Accountant","Tax Payment","Business License"] },
  { group: "Payroll",                  items: ["Employee Salary","Commission","Contractor Payment"] },
  { group: "Misc",                     items: ["Travel","Parking","Shipping","Miscellaneous"] },
];
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.items);

const PAYMENT_METHODS = ["bank","credit_card","cash"] as const;
const PM_LABEL: Record<string, string> = { bank: "Bank", credit_card: "Credit Card", cash: "Cash" };
const PM_ICON:  Record<string, string> = { bank: "🏦", credit_card: "💳", cash: "💵" };

const fmt$ = (n: number) => `$${n.toFixed(0)}`;
const fmt$2 = (n: number) => `$${n.toFixed(2)}`;

type Expense = {
  id: string; date: string; category: string; vendor: string | null;
  description: string | null; amount: number; payment_method: string; notes: string | null;
};

type RevenueEntry = { date: string; amount: number; tip: number };

const EMPTY_FORM = { date: "", category: "", vendor: "", description: "", amount: "", payment_method: "bank", notes: "" };

// months in YYYY-MM format going back 6 months
function recentMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function monthLabel(mk: string) {
  return new Date(`${mk}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Group expenses by category
function groupByCategory(expenses: Expense[]): { category: string; total: number; items: Expense[] }[] {
  const map = new Map<string, { total: number; items: Expense[] }>();
  for (const e of expenses) {
    if (!map.has(e.category)) map.set(e.category, { total: 0, items: [] });
    const g = map.get(e.category)!;
    g.total += e.amount;
    g.items.push(e);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total);
}

// ── CategoryPicker ─────────────────────────────────────────────
function CategoryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? ALL_CATEGORIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-left focus:outline-none focus:border-[#C9A84C] flex items-center justify-between">
        <span className={value ? "text-[#1C1C1C]" : "text-neutral-400"}>{value || "Category *"}</span>
        <span className="text-neutral-400 text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-neutral-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search or type custom..."
              className="w-full px-2 py-1.5 text-[12px] focus:outline-none" />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {search.trim() ? (
              <>
                {filtered!.map(c => (
                  <button key={c} type="button" onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-neutral-50 text-neutral-700">{c}</button>
                ))}
                {!filtered!.includes(search.trim()) && (
                  <button type="button" onClick={() => { onChange(search.trim()); setOpen(false); setSearch(""); }}
                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-amber-50 text-amber-600 font-semibold">
                    + Custom: "{search.trim()}"
                  </button>
                )}
              </>
            ) : (
              CATEGORY_GROUPS.map(g => (
                <div key={g.group}>
                  <p className="px-3 pt-2 pb-0.5 text-[9px] uppercase tracking-[0.12em] text-neutral-400 font-semibold">{g.group}</p>
                  {g.items.map(c => (
                    <button key={c} type="button" onClick={() => { onChange(c); setOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-neutral-50 ${value === c ? "text-[#C9A84C] font-semibold" : "text-neutral-700"}`}>{c}</button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini bar chart ─────────────────────────────────────────────
function CategoryBar({ label, amount, max, color }: { label: string; amount: number; max: number; color: string }) {
  const pct = max > 0 ? (amount / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-36 text-[11px] text-neutral-600 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-14 text-right text-[11px] font-semibold text-[#1C1C1C] tabular-nums shrink-0">{fmt$(amount)}</span>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────
export default function ExpensesView({ adminKey }: { adminKey: string }) {
  const [month, setMonth]         = useState(currentMonth());
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [revenue, setRevenue]     = useState<RevenueEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [editForm, setEditForm]   = useState(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [openCat, setOpenCat]     = useState<string | null>(null);

  const h = { Authorization: `Bearer ${adminKey}` };

  const load = useCallback(async () => {
    setLoading(true);
    const [expRes, revRes] = await Promise.all([
      fetch(`/api/admin/expenses?month=${month}`, { headers: h }),
      fetch(`/api/admin/revenue`, { headers: h }),
    ]);
    const expData = expRes.ok ? await expRes.json() : [];
    const revData = revRes.ok ? await revRes.json() : [];
    setExpenses(Array.isArray(expData) ? expData : []);
    setRevenue(Array.isArray(revData) ? revData : []);
    setLoading(false);
  }, [month, adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // ── Summaries ──────────────────────────────────────────────
  const monthRevenue = revenue
    .filter(e => e.date.startsWith(month))
    .reduce((s, e) => s + e.amount + e.tip, 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit     = monthRevenue - totalExpenses;
  const margin        = monthRevenue > 0 ? Math.round((netProfit / monthRevenue) * 100) : 0;
  const eachPartner   = netProfit > 0 ? netProfit / 2 : 0;

  const catGroups  = groupByCategory(expenses);
  const maxCatAmt  = catGroups[0]?.total ?? 1;

  const CAT_COLORS = ["#C9A84C","#1C1C1C","#6B7280","#9CA3AF","#D1D5DB","#F3F4F6","#FEF3C7","#FDE68A"];

  // ── Handlers ──────────────────────────────────────────────
  async function saveNew() {
    if (!form.date || !form.category || !form.amount) return;
    setSaving(true);
    const res = await fetch("/api/admin/expenses", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
    });
    if (res.ok) { await load(); setShowForm(false); setForm(EMPTY_FORM); }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    await fetch(`/api/admin/expenses/${id}`, {
      method: "PATCH", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, amount: parseFloat(editForm.amount) || 0 }),
    });
    await load();
    setEditId(null);
    setEditSaving(false);
  }

  async function deleteExpense(id: string) {
    await fetch(`/api/admin/expenses/${id}`, { method: "DELETE", headers: h });
    await load();
    setConfirmDel(null);
  }

  const months = recentMonths();

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[17px] font-bold text-[#1C1C1C]">Partner Settlement</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">Expenses · Net Profit · Partner Share</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C]">
            {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM, date: `${month}-${new Date().getDate().toString().padStart(2,"0")}` }); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            <span className="text-[16px] leading-none font-light">+</span> Add Expense
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Revenue", value: fmt$(monthRevenue), sub: month === currentMonth() ? "this month" : monthLabel(month), color: "text-[#1C1C1C]" },
            { label: "Expenses", value: fmt$(totalExpenses), sub: `${expenses.length} items`, color: "text-red-500" },
            { label: "Net Profit", value: fmt$(netProfit), sub: `${margin}% margin`, color: netProfit >= 0 ? "text-green-600" : "text-red-500" },
            { label: "Each Partner", value: fmt$(eachPartner), sub: "50 / 50 split", color: "text-[#C9A84C]" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-neutral-200 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-400 font-semibold mb-1">{card.label}</p>
              <p className={`text-[22px] font-bold tabular-nums ${card.color}`}>{card.value}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Partner Settlement Box */}
        {netProfit > 0 && (
          <div className="bg-[#1C1C1C] rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Monthly Settlement</p>
              <p className="text-white text-[13px]">
                Revenue <span className="font-bold text-[#C9A84C]">{fmt$(monthRevenue)}</span>
                {" − "} Expenses <span className="font-bold text-red-400">{fmt$(totalExpenses)}</span>
                {" = "} Net <span className="font-bold text-green-400">{fmt$(netProfit)}</span>
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              {["Partner A","Partner B"].map(p => (
                <div key={p} className="text-center">
                  <p className="text-[10px] text-neutral-400 mb-0.5">{p}</p>
                  <p className="text-[20px] font-bold text-[#C9A84C] tabular-nums">{fmt$2(eachPartner)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showForm && (
          <div className="bg-white border border-[#C9A84C]/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[14px] font-bold text-[#1C1C1C]">New Expense</h4>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00" className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">Category *</label>
                <CategoryPicker value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">Vendor / Merchant</label>
                <input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}
                  placeholder="e.g. Con Edison" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">Payment Method</label>
                <div className="flex gap-1.5">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m} type="button" onClick={() => setForm(p => ({ ...p, payment_method: m }))}
                      className={`flex-1 py-2 text-[11px] font-semibold rounded-lg border transition-all ${form.payment_method === m ? "bg-[#1C1C1C] text-white border-[#1C1C1C]" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                      {PM_ICON[m]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">Description / Notes</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional details..." className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">Cancel</button>
              <button onClick={saveNew} disabled={saving || !form.date || !form.category || !form.amount}
                className="px-5 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                {saving ? "Saving…" : "Save Expense"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-5 py-8 text-center text-[13px] text-neutral-400">Loading…</div>
        ) : expenses.length === 0 && !showForm ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-5 py-12 text-center">
            <p className="text-[14px] text-neutral-300">No expenses for {monthLabel(month)}</p>
            <p className="text-[12px] text-neutral-300 mt-1">Click "+ Add Expense" to get started</p>
          </div>
        ) : (
          <>
            {/* Category Breakdown */}
            {catGroups.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
                <p className="text-[12px] font-bold text-[#1C1C1C] mb-3">Expenses by Category</p>
                <div className="space-y-2.5">
                  {catGroups.map((g, i) => (
                    <CategoryBar key={g.category} label={g.category} amount={g.total} max={maxCatAmt} color={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between text-[12px]">
                  <span className="text-neutral-400">Total</span>
                  <span className="font-bold text-[#1C1C1C] tabular-nums">{fmt$2(totalExpenses)}</span>
                </div>
              </div>
            )}

            {/* Expense list grouped by category */}
            <div className="space-y-2">
              {catGroups.map((g, gi) => {
                const isOpen = openCat === g.category || openCat === null;
                return (
                  <div key={g.category} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {/* Category header */}
                    <button onClick={() => setOpenCat(openCat === g.category ? null : g.category)}
                      className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-neutral-50/50 transition-colors">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[gi % CAT_COLORS.length] }} />
                      <span className="flex-1 text-[13px] font-bold text-[#1C1C1C]">{g.category}</span>
                      <span className="text-[11px] text-neutral-400">{g.items.length} item{g.items.length !== 1 ? "s" : ""}</span>
                      <span className="text-[14px] font-bold text-[#1C1C1C] tabular-nums">{fmt$2(g.total)}</span>
                      <span className={`text-neutral-400 text-[13px] transition-transform duration-200 ${openCat === g.category ? "rotate-180" : openCat === null ? "" : ""}`}>⌄</span>
                    </button>

                    {/* Items */}
                    {(openCat === g.category || openCat === null) && (
                      <div className="border-t border-neutral-100">
                        {g.items.map(e => (
                          editId === e.id ? (
                            // Edit form inline
                            <div key={e.id} className="px-5 py-3 border-b border-neutral-50 space-y-2 bg-neutral-50">
                              <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={editForm.date} onChange={ev => setEditForm(p => ({ ...p, date: ev.target.value }))}
                                  className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">$</span>
                                  <input type="number" min="0" step="0.01" value={editForm.amount} onChange={ev => setEditForm(p => ({ ...p, amount: ev.target.value }))}
                                    className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                                </div>
                                <div className="col-span-2">
                                  <CategoryPicker value={editForm.category} onChange={v => setEditForm(p => ({ ...p, category: v }))} />
                                </div>
                                <input value={editForm.vendor} onChange={ev => setEditForm(p => ({ ...p, vendor: ev.target.value }))}
                                  placeholder="Vendor" className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                                <input value={editForm.notes} onChange={ev => setEditForm(p => ({ ...p, notes: ev.target.value }))}
                                  placeholder="Notes" className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                              </div>
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={() => setEditId(null)} className="text-[11px] text-neutral-400 px-2 py-1">Cancel</button>
                                <button onClick={() => saveEdit(e.id)} disabled={editSaving}
                                  className="px-3 py-1 bg-[#1C1C1C] text-white text-[11px] rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                                  {editSaving ? "…" : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : confirmDel === e.id ? (
                            <div key={e.id} className="px-5 py-3.5 border-b border-red-100 bg-red-50/50 flex items-center justify-between gap-3">
                              <p className="text-[12px] text-[#1C1C1C]">
                                確定刪除 <span className="font-bold">{e.vendor || e.category}</span> {fmt$2(e.amount)}？
                              </p>
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => setConfirmDel(null)} className="px-3 py-1 text-[11px] border border-neutral-200 rounded-lg text-neutral-500">取消</button>
                                <button onClick={() => deleteExpense(e.id)} className="px-3 py-1 text-[11px] bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">確定刪除</button>
                              </div>
                            </div>
                          ) : (
                            <div key={e.id} className="flex items-center gap-3 px-5 py-3 border-b border-neutral-50 last:border-b-0 hover:bg-neutral-50/50 transition-colors">
                              <span className="text-[11px] text-neutral-400 tabular-nums shrink-0 w-16">{e.date.slice(5)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{e.vendor || "—"}</p>
                                {e.notes && <p className="text-[11px] text-neutral-400 truncate">{e.notes}</p>}
                              </div>
                              <span className="text-[11px] text-neutral-400 shrink-0">{PM_ICON[e.payment_method]}</span>
                              <span className="text-[14px] font-bold text-[#1C1C1C] tabular-nums shrink-0 w-16 text-right">{fmt$2(e.amount)}</span>
                              <div className="flex gap-0.5 shrink-0">
                                <button onClick={() => { setEditId(e.id); setEditForm({ date: e.date, category: e.category, vendor: e.vendor ?? "", description: e.description ?? "", amount: String(e.amount), payment_method: e.payment_method, notes: e.notes ?? "" }); }}
                                  className="text-[11px] text-neutral-300 hover:text-neutral-600 px-1.5 py-1">Edit</button>
                                <button onClick={() => setConfirmDel(e.id)}
                                  className="text-[11px] text-neutral-300 hover:text-red-400 px-1.5 py-1">✕</button>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Top expenses */}
            {expenses.length >= 3 && (
              <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
                <p className="text-[12px] font-bold text-[#1C1C1C] mb-3">Top 10 Largest Expenses</p>
                <div className="space-y-2">
                  {[...expenses].sort((a, b) => b.amount - a.amount).slice(0, 10).map((e, i) => (
                    <div key={e.id} className="flex items-center gap-3">
                      <span className="text-[11px] text-neutral-300 w-4 tabular-nums shrink-0">{i + 1}</span>
                      <span className="flex-1 text-[12px] text-neutral-600 truncate">{e.vendor || e.category}</span>
                      <span className="text-[11px] text-neutral-400 shrink-0">{e.category}</span>
                      <span className="text-[13px] font-bold text-[#1C1C1C] tabular-nums shrink-0 w-16 text-right">{fmt$2(e.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

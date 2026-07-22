"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ── Category definitions ───────────────────────────────────────
const CATEGORY_GROUPS: { group: string; items: string[] }[] = [
  { group: "固定支出",    items: ["房租","電費","水費","網路費","電話費","保險"] },
  { group: "行銷",        items: ["Google 廣告"] },
  { group: "軟體 / 訂閱", items: ["Square","Twilio","OpenPhone","Google Workspace","網域","Vercel","Supabase","Resend","Cloudflare","Canva","ChatGPT","Cursor","Figma"] },
  { group: "業務營運",    items: ["辦公用品","清潔用品","茶水零食","美容用品","睫毛材料","紋繡材料","耗材","洗衣費","設備採購","維修保養"] },
  { group: "財務",        items: ["稅款","營業執照"] },
  { group: "薪資",        items: ["員工薪資","佣金"] },
  { group: "其他",        items: ["交通費","停車費","運費","雜費"] },
];
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.items);

const PAYMENT_METHODS = ["bank","credit_card","cash"] as const;
const PM_ICON: Record<string, string> = { bank: "🏦", credit_card: "💳", cash: "💵" };

const fmt$ = (n: number) => `$${n.toFixed(0)}`;
const fmt$2 = (n: number) => `$${n.toFixed(2)}`;

type Expense = {
  id: string; date: string; category: string; vendor: string | null;
  description: string | null; amount: number; payment_method: string;
  notes: string | null; recorded_by: string | null;
};

type RevenueEntry = { date: string; amount: number; tip: number };

const EMPTY_FORM = { date: "", category: "", vendor: "", description: "", amount: "", payment_method: "bank", notes: "" };

function monthLabel(mk: string) {
  return new Date(`${mk}-01T12:00:00`).toLocaleDateString("zh-TW", { month: "long", year: "numeric" });
}

// ── Month Picker ───────────────────────────────────────────────
const YEAR_MONTHS: Record<number, number[]> = {
  2026: [7, 8, 9, 10, 11, 12],
  2027: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  2028: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hoverYear, setHoverYear] = useState<number>(() => parseInt(value.split("-")[0]));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const months = YEAR_MONTHS[hoverYear] ?? [];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setHoverYear(parseInt(value.split("-")[0])); setOpen(o => !o); }}
        className="flex items-center gap-1.5 border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#1C1C1C] hover:border-neutral-400 transition-colors focus:outline-none">
        {monthLabel(value)}
        <span className="text-neutral-400 text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 right-0 bg-[#1C1C1C] rounded-2xl shadow-2xl flex overflow-hidden">
          {/* Year column */}
          <div className="py-2 border-r border-white/10 min-w-[80px]">
            {[2026, 2027, 2028].map(y => (
              <button key={y}
                onMouseEnter={() => setHoverYear(y)}
                onClick={() => setHoverYear(y)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                  hoverYear === y ? "text-white bg-white/10" : "text-neutral-500 hover:text-neutral-300"
                }`}>
                <span>{y}年</span>
                <span className="text-[11px] opacity-60">›</span>
              </button>
            ))}
          </div>
          {/* Month column */}
          <div className="py-2 min-w-[72px]">
            {months.map(m => {
              const key = `${hoverYear}-${String(m).padStart(2, "0")}`;
              const selected = key === value;
              return (
                <button key={key} onClick={() => { onChange(key); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-[13px] transition-colors ${
                    selected ? "text-white font-semibold" : "text-neutral-400 hover:text-white"
                  }`}>
                  <span className="w-3 text-[11px] shrink-0">{selected ? "✓" : ""}</span>
                  {m}月
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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
        <span className={value ? "text-[#1C1C1C]" : "text-neutral-400"}>{value || "分類 *"}</span>
        <span className="text-neutral-400 text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-neutral-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜尋或自訂分類…"
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
                    + 自訂：「{search.trim()}」
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
  const [month, setMonth]           = useState(currentMonth());
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [revenue, setRevenue]       = useState<RevenueEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [openCat, setOpenCat]       = useState<string | null>(null);

  // Who? modal
  const [whoVisible, setWhoVisible] = useState(false);
  const [whoName, setWhoName]       = useState("");
  const whoResolverRef = useRef<((name: string) => void) | null>(null);

  function askWho(): Promise<string> {
    return new Promise(resolve => {
      whoResolverRef.current = resolve;
      setWhoName("");
      setWhoVisible(true);
    });
  }

  function confirmWho() {
    if (!whoName.trim()) return;
    whoResolverRef.current?.(whoName.trim());
    whoResolverRef.current = null;
    setWhoVisible(false);
  }

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
  // July 2026 started 7/20 (partner join date); all other months count full month
  const monthRevenue = revenue
    .filter(e => month === "2026-07" ? e.date >= "2026-07-20" : e.date.startsWith(month))
    .reduce((s, e) => s + e.amount + e.tip, 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit     = monthRevenue - totalExpenses;
  const margin        = monthRevenue > 0 ? Math.round((netProfit / monthRevenue) * 100) : 0;
  const partnerA      = netProfit > 0 ? netProfit * 0.7 : 0;
  const partnerB      = netProfit > 0 ? netProfit * 0.3 : 0;

  const catGroups = groupByCategory(expenses);
  const maxCatAmt = catGroups[0]?.total ?? 1;
  const CAT_COLORS = ["#C9A84C","#1C1C1C","#6B7280","#9CA3AF","#D1D5DB","#F3F4F6","#FEF3C7","#FDE68A"];

  // ── Handlers ──────────────────────────────────────────────
  async function saveNew() {
    if (!form.date || !form.category || !form.amount) return;
    const who = await askWho();
    setSaving(true);
    const res = await fetch("/api/admin/expenses", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0, recorded_by: who }),
    });
    if (res.ok) { await load(); setShowForm(false); setForm(EMPTY_FORM); }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    const who = await askWho();
    setEditSaving(true);
    await fetch(`/api/admin/expenses/${id}`, {
      method: "PATCH", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, amount: parseFloat(editForm.amount) || 0, recorded_by: who }),
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

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">

      {/* Who? modal */}
      {whoVisible && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-72">
            <h4 className="text-[15px] font-bold text-[#1C1C1C] mb-1">誰在記錄？</h4>
            <p className="text-[12px] text-neutral-400 mb-4">必須填寫名字才能繼續。</p>
            <input
              autoFocus
              value={whoName}
              onChange={e => setWhoName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && whoName.trim() && confirmWho()}
              placeholder="輸入姓名…"
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C] mb-3"
            />
            <button
              onClick={confirmWho}
              disabled={!whoName.trim()}
              className="w-full px-4 py-2 bg-[#1C1C1C] text-white text-[13px] font-semibold rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              確認
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[17px] font-bold text-[#1C1C1C]">合夥人結算</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">支出 · 淨利 · 分潤計算</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthPicker value={month} onChange={setMonth} />
          <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM, date: `${month}-${new Date().getDate().toString().padStart(2,"0")}` }); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            <span className="text-[16px] leading-none font-light">+</span> 新增支出
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "營業額", value: fmt$(monthRevenue), sub: month === currentMonth() ? "本月（自動同步）" : monthLabel(month), color: "text-[#1C1C1C]" },
            { label: "支出", value: fmt$(totalExpenses), sub: `${expenses.length} 筆`, color: "text-red-500" },
            { label: "淨利", value: fmt$(netProfit), sub: `利潤率 ${margin}%`, color: netProfit >= 0 ? "text-green-600" : "text-red-500" },
            { label: "分潤", value: fmt$(partnerA), sub: "70 / 30 分潤", color: "text-[#C9A84C]" },
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
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">本月結算</p>
              <p className="text-white text-[13px]">
                營業額 <span className="font-bold text-[#C9A84C]">{fmt$(monthRevenue)}</span>
                {" − "} 支出 <span className="font-bold text-red-400">{fmt$(totalExpenses)}</span>
                {" = "} 淨利 <span className="font-bold text-green-400">{fmt$(netProfit)}</span>
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="text-center">
                <p className="text-[10px] text-neutral-400 mb-0.5">合夥人甲 (70%)</p>
                <p className="text-[20px] font-bold text-[#C9A84C] tabular-nums">{fmt$2(partnerA)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-neutral-400 mb-0.5">合夥人乙 (30%)</p>
                <p className="text-[20px] font-bold text-[#C9A84C] tabular-nums">{fmt$2(partnerB)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showForm && (
          <div className="bg-white border border-[#C9A84C]/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[14px] font-bold text-[#1C1C1C]">新增支出</h4>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">日期 *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">金額 *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">$</span>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00" className="w-full border border-neutral-200 rounded-lg pl-6 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">分類 *</label>
                <CategoryPicker value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">商家 / 名稱</label>
                <input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}
                  placeholder="例：Con Edison" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">付款方式</label>
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
                <label className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 block mb-1">備註</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="選填…" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">取消</button>
              <button onClick={saveNew} disabled={saving || !form.date || !form.category || !form.amount}
                className="px-5 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                {saving ? "儲存中…" : "儲存支出"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-5 py-8 text-center text-[13px] text-neutral-400">載入中…</div>
        ) : expenses.length === 0 && !showForm ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-5 py-12 text-center">
            <p className="text-[14px] text-neutral-300">{monthLabel(month)} 尚無支出記錄</p>
            <p className="text-[12px] text-neutral-300 mt-1">點擊「+ 新增支出」開始記錄</p>
          </div>
        ) : (
          <>
            {/* Category Breakdown */}
            {catGroups.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
                <p className="text-[12px] font-bold text-[#1C1C1C] mb-3">各類支出</p>
                <div className="space-y-2.5">
                  {catGroups.map((g, i) => (
                    <CategoryBar key={g.category} label={g.category} amount={g.total} max={maxCatAmt} color={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between text-[12px]">
                  <span className="text-neutral-400">合計</span>
                  <span className="font-bold text-[#1C1C1C] tabular-nums">{fmt$2(totalExpenses)}</span>
                </div>
              </div>
            )}

            {/* Expense list grouped by category */}
            <div className="space-y-2">
              {catGroups.map((g, gi) => (
                <div key={g.category} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <button onClick={() => setOpenCat(openCat === g.category ? null : g.category)}
                    className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-neutral-50/50 transition-colors">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[gi % CAT_COLORS.length] }} />
                    <span className="flex-1 text-[13px] font-bold text-[#1C1C1C]">{g.category}</span>
                    <span className="text-[11px] text-neutral-400">{g.items.length} 筆</span>
                    <span className="text-[14px] font-bold text-[#1C1C1C] tabular-nums">{fmt$2(g.total)}</span>
                    <span className={`text-neutral-400 text-[13px] transition-transform duration-200 ${openCat === g.category ? "rotate-180" : ""}`}>⌄</span>
                  </button>

                  {(openCat === g.category || openCat === null) && (
                    <div className="border-t border-neutral-100">
                      {g.items.map(e => (
                        editId === e.id ? (
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
                                placeholder="商家" className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                              <input value={editForm.notes} onChange={ev => setEditForm(p => ({ ...p, notes: ev.target.value }))}
                                placeholder="備註" className="border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                            </div>
                            <div className="flex gap-1.5 justify-end">
                              <button onClick={() => setEditId(null)} className="text-[11px] text-neutral-400 px-2 py-1">取消</button>
                              <button onClick={() => saveEdit(e.id)} disabled={editSaving}
                                className="px-3 py-1 bg-[#1C1C1C] text-white text-[11px] rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                                {editSaving ? "…" : "儲存"}
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
                            <span className="text-[11px] text-neutral-400 tabular-nums shrink-0 w-14">{e.date.slice(5)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{e.vendor || "—"}</p>
                              {e.notes && <p className="text-[11px] text-neutral-400 truncate">{e.notes}</p>}
                            </div>
                            {e.recorded_by && (
                              <span className="text-[10px] text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5 shrink-0">{e.recorded_by}</span>
                            )}
                            <span className="text-[11px] text-neutral-400 shrink-0">{PM_ICON[e.payment_method]}</span>
                            <span className="text-[14px] font-bold text-[#1C1C1C] tabular-nums shrink-0 w-16 text-right">{fmt$2(e.amount)}</span>
                            <div className="flex gap-0.5 shrink-0">
                              <button onClick={() => { setEditId(e.id); setEditForm({ date: e.date, category: e.category, vendor: e.vendor ?? "", description: e.description ?? "", amount: String(e.amount), payment_method: e.payment_method, notes: e.notes ?? "" }); }}
                                className="text-[11px] text-neutral-300 hover:text-neutral-600 px-1.5 py-1">編輯</button>
                              <button onClick={() => setConfirmDel(e.id)}
                                className="text-[11px] text-neutral-300 hover:text-red-400 px-1.5 py-1">✕</button>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Top expenses */}
            {expenses.length >= 3 && (
              <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
                <p className="text-[12px] font-bold text-[#1C1C1C] mb-3">前十大支出</p>
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

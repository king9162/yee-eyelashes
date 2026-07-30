"use client";
import { useState, useEffect } from "react";

type Coupon = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  discount_type: string;
  discount_value: number;
  minimum_spend: number;
  valid_days: number | null;
  active: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  birthday: "Birthday", fixed_amount: "Fixed Amount", percentage: "Percentage",
  free_product: "Free Product", free_addon: "Free Add-on",
  double_points: "Double Points", referral: "Referral",
  winback: "Win-back", app_exclusive: "App Exclusive",
};

const EMPTY: Omit<Coupon, "id" | "active"> = {
  name: "", description: "", type: "fixed_amount",
  discount_type: "fixed", discount_value: 0,
  minimum_spend: 0, valid_days: 30,
};

export default function CouponsView({ adminKey }: { adminKey: string }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [msg, setMsg] = useState("");

  const h = { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" };

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${adminKey}` } });
    const data = await res.json();
    setCoupons(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function seed() {
    setSeeding(true);
    await fetch("/api/admin/seed-coupons", { method: "POST", headers: { Authorization: `Bearer ${adminKey}` } });
    setSeeding(false);
    await load();
  }

  async function create() {
    if (!form.name.trim() || form.discount_value <= 0) {
      setMsg("Name and discount value are required.");
      return;
    }
    setSaving(true); setMsg("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: h,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg(`Error: ${data.error}`); return; }
    setMsg("Coupon template created!");
    setForm({ ...EMPTY });
    setCreating(false);
    await load();
    setTimeout(() => setMsg(""), 3000);
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ active: !c.active }),
    });
    await load();
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#1C1C1C]">Coupon Templates</h2>
            <p className="text-[12px] text-neutral-400 mt-0.5">Templates used to issue coupons to members</p>
          </div>
          <div className="flex gap-2">
            {coupons.length === 0 && (
              <button onClick={seed} disabled={seeding}
                className="px-4 py-2 text-[12px] border border-neutral-300 rounded-lg hover:border-[#C9A84C] transition-colors disabled:opacity-40">
                {seeding ? "Seeding…" : "Seed Defaults"}
              </button>
            )}
            <button onClick={() => setCreating(!creating)}
              className="px-4 py-2 text-[12px] font-semibold bg-[#1C1C1C] text-white rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
              {creating ? "Cancel" : "+ New Template"}
            </button>
          </div>
        </div>

        {msg && (
          <p className={`text-[12px] font-semibold ${msg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>{msg}</p>
        )}

        {/* Create form */}
        {creating && (
          <div className="bg-white rounded-xl border border-[#C9A84C]/30 p-5 space-y-4">
            <p className="text-[13px] font-bold text-[#1C1C1C]">New Coupon Template</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Summer Special — 20% Off"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Description</label>
                <input value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Shown to member on the coupon card"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#C9A84C]">
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Discount Type</label>
                <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#C9A84C]">
                  <option value="fixed">Fixed ($)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">
                  Discount Value {form.discount_type === "fixed" ? "($)" : "(%)"}
                </label>
                <input value={form.discount_value} type="number" min="0"
                  onChange={e => setForm(f => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Valid Days (from issue)</label>
                <input value={form.valid_days ?? ""} type="number" min="1" placeholder="e.g. 30"
                  onChange={e => setForm(f => ({ ...f, valid_days: parseInt(e.target.value) || null }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>
            <button onClick={create} disabled={saving}
              className="w-full py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
              {saving ? "Creating…" : "Create Template"}
            </button>
          </div>
        )}

        {/* Template list */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <p className="text-[13px] text-neutral-400 mb-2">No coupon templates yet</p>
            <p className="text-[11px] text-neutral-300">Click &quot;Seed Defaults&quot; to create the standard templates, or create a custom one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {coupons.map(c => (
              <div key={c.id}
                className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 ${c.active ? "border-neutral-100" : "border-neutral-100 opacity-50"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{c.name}</p>
                    <span className="shrink-0 text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                      {TYPE_LABELS[c.type] ?? c.type}
                    </span>
                  </div>
                  {c.description && <p className="text-[11px] text-neutral-400 truncate">{c.description}</p>}
                  <div className="flex gap-3 mt-1 text-[11px] text-neutral-400">
                    <span className="text-[#C9A84C] font-semibold">
                      {c.discount_type === "fixed" ? `$${c.discount_value} off` : `${c.discount_value}% off`}
                    </span>
                    {c.valid_days && <span>{c.valid_days} days validity</span>}
                    {c.minimum_spend > 0 && <span>Min. ${c.minimum_spend}</span>}
                  </div>
                </div>
                <button onClick={() => toggleActive(c)}
                  className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                    c.active
                      ? "bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500"
                      : "bg-neutral-100 text-neutral-400 hover:bg-green-50 hover:text-green-600"
                  }`}>
                  {c.active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

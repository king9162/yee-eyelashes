"use client";
import { useState, useEffect, useCallback } from "react";

type Member = {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  vip_tier: string;
  points_balance: number;
  total_spend_all_time: number;
  total_visits_all_time: number;
  last_visit_date: string | null;
  joined_at: string;
  referral_code: string | null;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  notes: string | null;
  created_by: string;
  created_at: string;
};

type LashRecord = {
  id: string;
  service_date: string;
  service_type: string | null;
  material: string | null;
  style: string | null;
  length: string | null;
  curl: string | null;
  lash_count: number | null;
  technician_notes: string | null;
  photo_url: string | null;
};

type MemberBooking = {
  id: string;
  date: string;
  time: string | null;
  service: string | null;
  status: string;
  price: number | null;
};

type MemberCoupon = {
  id: string;
  status: string;
  issued_at: string;
  expires_at: string | null;
  used_at: string | null;
  notes: string | null;
  coupons: { id: string; name: string; description: string | null; discount_type: string; discount_value: number } | null;
};

type CouponTemplate = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  discount_type: string;
  discount_value: number;
  active: boolean;
};

const TIER_COLORS: Record<string, string> = {
  member: "#888", silver: "#C0C0C0", gold: "#C9A84C", diamond: "#A8DAFF",
};

const TXN_LABELS: Record<string, string> = {
  purchase_earned: "Points Earned", referral_reward: "Referral",
  birthday_bonus: "Birthday Reward", promotion_bonus: "Promotion",
  manual_adjustment: "Manual Adjust", redemption: "Redeemed",
  refund_adjustment: "Refund", expired: "Expired",
};

function discountLabel(c: CouponTemplate | MemberCoupon["coupons"]) {
  if (!c) return "";
  return c.discount_type === "fixed" ? `$${c.discount_value} off` : `${c.discount_value}% off`;
}

function birthdayInfo(birthday: string | null): { display: string; countdown: number | null } | null {
  if (!birthday) return null;
  const parts = birthday.split("-").map(Number);
  const bdayMonth = parts[1], bdayDay = parts[2];
  if (!bdayMonth || !bdayDay) return null;
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(today.getFullYear(), bdayMonth - 1, bdayDay);
  if (next < todayMid) next = new Date(today.getFullYear() + 1, bdayMonth - 1, bdayDay);
  const days = Math.ceil((next.getTime() - todayMid.getTime()) / 86400000);
  const display = `${String(bdayMonth).padStart(2, "0")}/${String(bdayDay).padStart(2, "0")}`;
  return { display, countdown: days };
}

export default function MembersView({ adminKey }: { adminKey: string }) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [detail, setDetail] = useState<{ profile: Member; txns: Transaction[]; coupons: MemberCoupon[]; bookings: MemberBooking[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [couponTemplates, setCouponTemplates] = useState<CouponTemplate[]>([]);

  // Award points state
  const [awardAmount, setAwardAmount] = useState("");
  const [awardType, setAwardType] = useState("purchase_earned");
  const [awardNotes, setAwardNotes] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardMsg, setAwardMsg] = useState("");

  // Issue coupon state
  const [issueCouponId, setIssueCouponId] = useState("");
  const [issueCouponNotes, setIssueCouponNotes] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issueMsg, setIssueMsg] = useState("");

  // Re-link bookings
  const [relinking, setRelinking] = useState(false);
  const [relinkMsg, setRelinkMsg] = useState("");

  // Lash record
  const [lashRecords, setLashRecords] = useState<LashRecord[]>([]);
  const [showLashForm, setShowLashForm] = useState(false);
  const [lashForm, setLashForm] = useState({ service_date: new Date().toLocaleDateString("en-CA"), service_type: "", material: "", style: "", length: "", curl: "", lash_count: "", technician_notes: "", client_requests: "" });
  const [savingLash, setSavingLash] = useState(false);
  const [lashMsg, setLashMsg] = useState("");

  // Edit member modal
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", birthday: "", member_id: "", admin_notes: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete member modal
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Seed coupons
  const [seeding, setSeeding] = useState(false);

  // Renumber members
  const [renumbering, setRenumbering] = useState(false);

  // Collapsible panels
  const [showAwardPanel, setShowAwardPanel] = useState(false);
  const [showIssueCouponPanel, setShowIssueCouponPanel] = useState(false);

  // Sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [adminKey]);

  useEffect(() => { search(""); }, [search]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  // Load coupon templates once
  useEffect(() => {
    fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then(r => r.json())
      .then(d => {
        const templates = Array.isArray(d) ? d : [];
        setCouponTemplates(templates.filter((t: CouponTemplate) => t.active));
        if (templates.length > 0) setIssueCouponId(templates[0].id);
      })
      .catch(() => {});
  }, [adminKey]);

  async function loadDetail(m: Member) {
    setSelected(m);
    setDetail(null);
    setDetailLoading(true);
    setAwardMsg(""); setIssueMsg(""); setRelinkMsg(""); setLashMsg("");
    setShowLashForm(false);

    const [detailRes, lashRes] = await Promise.all([
      fetch(`/api/admin/members/${m.id}`, { headers: { Authorization: `Bearer ${adminKey}` } }),
      fetch(`/api/admin/members/${m.id}/lash-records`, { headers: { Authorization: `Bearer ${adminKey}` } }),
    ]);
    const [data, lashData] = await Promise.all([detailRes.json(), lashRes.json()]);
    setDetail(data);
    setLashRecords(Array.isArray(lashData) ? lashData : []);
    setDetailLoading(false);
  }

  async function saveLashRecord() {
    if (!selected || !lashForm.service_date) return;
    setSavingLash(true); setLashMsg("");
    const res = await fetch(`/api/admin/members/${selected.id}/lash-records`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(lashForm),
    });
    const d = await res.json();
    setSavingLash(false);
    if (!res.ok) { setLashMsg(`Error: ${d.error}`); return; }
    setLashMsg("Lash record saved!");
    setShowLashForm(false);
    setLashForm({ service_date: new Date().toLocaleDateString("en-CA"), service_type: "", material: "", style: "", length: "", curl: "", lash_count: "", technician_notes: "", client_requests: "" });
    const lr = await fetch(`/api/admin/members/${selected.id}/lash-records`, { headers: { Authorization: `Bearer ${adminKey}` } });
    const lrData = await lr.json();
    setLashRecords(Array.isArray(lrData) ? lrData : []);
  }

  async function awardPoints() {
    if (!selected || !awardAmount) return;
    const amt = parseInt(awardAmount);
    if (isNaN(amt) || amt === 0) return;
    setAwarding(true); setAwardMsg("");

    const res = await fetch(`/api/admin/members/${selected.id}/points`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, type: awardType, notes: awardNotes || null, created_by: "admin" }),
    });
    const d = await res.json();
    setAwarding(false);

    if (!res.ok) { setAwardMsg(`Error: ${d.error}`); return; }
    setAwardMsg(`Done! New balance: ${d.new_balance} pts`);
    setAwardAmount(""); setAwardNotes("");
    await loadDetail(selected);
    search(query);
  }

  async function issueCoupon() {
    if (!selected || !issueCouponId) return;
    setIssuing(true); setIssueMsg("");

    const res = await fetch(`/api/admin/members/${selected.id}/coupons`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ coupon_id: issueCouponId, notes: issueCouponNotes || null }),
    });
    const d = await res.json();
    setIssuing(false);

    if (!res.ok) { setIssueMsg(`Error: ${d.error}`); return; }
    setIssueMsg("Coupon issued!");
    setIssueCouponNotes("");
    await loadDetail(selected);
  }

  async function relinkBookings() {
    if (!selected) return;
    setRelinking(true); setRelinkMsg("");
    const res = await fetch(`/api/admin/members/${selected.id}/link-bookings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    const d = await res.json();
    setRelinking(false);
    setRelinkMsg(res.ok ? `Done — linked ${d.linked} booking${d.linked !== 1 ? "s" : ""}` : `Error: ${d.error}`);
    if (res.ok) { await loadDetail(selected); search(query); }
  }

  async function redeemCoupon(couponId: string) {
    if (!selected) return;
    const res = await fetch(`/api/admin/members/${selected.id}/coupons/${couponId}/redeem`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ used_by: "admin" }),
    });
    if (res.ok) await loadDetail(selected);
  }

  async function confirmDelete() {
    if (!deletingMember || !deletePassword) return;
    setDeleteLoading(true);
    setDeleteError("");
    const res = await fetch(`/api/admin/members/${deletingMember.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${deletePassword}` },
    });
    setDeleteLoading(false);
    if (res.status === 401) { setDeleteError("Incorrect password."); return; }
    if (!res.ok) { const d = await res.json(); setDeleteError(d.error ?? "Delete failed."); return; }
    if (selected?.id === deletingMember.id) { setSelected(null); setDetail(null); }
    setMembers(prev => prev.filter(m => m.id !== deletingMember.id));
    setDeletingMember(null);
    setDeletePassword("");
    setDeleteError("");
  }

  function openEdit(m: Member) {
    setEditingMember(m);
    setEditForm({
      first_name:   m.first_name   ?? "",
      last_name:    m.last_name    ?? "",
      email:        m.email        ?? "",
      phone:        m.phone        ?? "",
      birthday:     m.birthday     ?? "",
      member_id:    m.member_id    ?? "",
      admin_notes:  (m as Member & { admin_notes?: string }).admin_notes ?? "",
    });
    setEditError("");
  }

  async function saveEdit() {
    if (!editingMember) return;
    setEditSaving(true); setEditError("");

    // Auto-format member_id: "1" or "001" → "YEE-00001"
    let mid = editForm.member_id.trim().toUpperCase();
    if (/^\d+$/.test(mid)) mid = `YEE-${mid.padStart(5, "0")}`;

    const res = await fetch(`/api/admin/members/${editingMember.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, member_id: mid }),
    });
    const d = await res.json();
    setEditSaving(false);
    if (!res.ok) { setEditError(d.error ?? "Update failed."); return; }

    setEditingMember(null);
    search(query);
    if (selected?.id === editingMember.id) {
      const updated: Member = { ...editingMember, ...editForm, member_id: mid };
      setSelected(updated);
      await loadDetail(updated);
    }
  }

  async function seedCoupons() {
    setSeeding(true);
    await fetch("/api/admin/seed-coupons", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    setSeeding(false);
    // Reload templates
    const res = await fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${adminKey}` } });
    const d = await res.json();
    const templates = Array.isArray(d) ? d : [];
    setCouponTemplates(templates.filter((t: CouponTemplate) => t.active));
    if (templates.length > 0) setIssueCouponId(templates[0].id);
  }

  return (
    <>
    <div className="flex h-[calc(100vh-64px)]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Left: list */}
      <div className="w-80 border-r border-neutral-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-[#1C1C1C] mb-3">Members</h2>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, phone, email…"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-[12px] text-neutral-400 text-center py-8">Loading…</p>
          ) : members.length === 0 ? (
            <p className="text-[12px] text-neutral-400 text-center py-8">No members found</p>
          ) : (
            members.map(m => {
              const bday = birthdayInfo(m.birthday);
              return (
                <div
                  key={m.id}
                  className={`relative group border-b border-neutral-50 transition-colors ${selected?.id === m.id ? "bg-neutral-50" : "hover:bg-neutral-50"}`}
                >
                  <button
                    onClick={() => loadDetail(m)}
                    className="w-full text-left px-4 py-3 pr-10"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-[#1C1C1C]">
                        {m.first_name} {m.last_name}
                      </p>
                      <span className="text-[10px] font-bold uppercase" style={{ color: TIER_COLORS[m.vip_tier] }}>
                        {m.vip_tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{m.member_id}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-neutral-400">{m.total_visits_all_time} visits</span>
                      {bday && (
                        <span className={`text-[11px] font-semibold ${bday.countdown !== null && bday.countdown <= 14 ? "text-[#C9A84C]" : "text-neutral-400"}`}>
                          🎂 {bday.display}
                          {bday.countdown === 0 ? " · Today!" : bday.countdown === 1 ? " · Tomorrow!" : bday.countdown !== null && bday.countdown <= 30 ? ` · ${bday.countdown}d` : ""}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeletingMember(m); setDeletePassword(""); setDeleteError(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded text-neutral-300 hover:text-red-400 hover:bg-red-50 text-[15px]"
                    title="Delete member"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <p className="text-[11px] text-neutral-400">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                if (!confirm("Renumber all members by join date? (001, 002, 003…) This cannot be undone.")) return;
                setRenumbering(true);
                const res = await fetch("/api/admin/renumber-members", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${adminKey}` },
                });
                const d = await res.json();
                setRenumbering(false);
                if (res.ok) {
                  alert(`Done — ${d.updated} member${d.updated !== 1 ? "s" : ""} renumbered.`);
                  search(query);
                  if (selected) await loadDetail(selected);
                } else {
                  alert(`Error: ${d.error}`);
                }
              }}
              disabled={renumbering}
              className="text-[10px] text-neutral-400 hover:text-[#C9A84C] transition-colors disabled:opacity-40"
            >
              {renumbering ? "Renumbering…" : "Renumber"}
            </button>
            {couponTemplates.length === 0 && (
              <button
                onClick={seedCoupons}
                disabled={seeding}
                className="text-[10px] text-[#C9A84C] hover:underline disabled:opacity-40"
              >
                {seeding ? "Seeding…" : "Seed coupons"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: detail */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAF8]">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-neutral-400">Select a member to view details</p>
          </div>
        ) : detailLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : detail ? (
          <div className="p-6 space-y-5 max-w-xl">
            {/* Profile header */}
            <div className="bg-white rounded-xl border border-neutral-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[18px] font-bold text-[#1C1C1C]">
                    {detail.profile.first_name} {detail.profile.last_name}
                  </p>
                  <p className="text-[12px] text-neutral-400">{detail.profile.member_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full"
                    style={{
                      color: TIER_COLORS[detail.profile.vip_tier],
                      background: `${TIER_COLORS[detail.profile.vip_tier]}22`,
                      border: `1px solid ${TIER_COLORS[detail.profile.vip_tier]}44`,
                    }}
                  >
                    {detail.profile.vip_tier}
                  </span>
                  <button
                    onClick={() => openEdit(detail.profile)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-[#C9A84C] hover:text-white transition-colors text-neutral-500"
                    title="Edit member info"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setSelected(null); setDetail(null); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500 text-[14px] leading-none"
                    title="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                {[
                  { label: "Email", value: detail.profile.email ?? "—" },
                  { label: "Phone", value: detail.profile.phone ?? "—" },
                  { label: "Joined", value: new Date(detail.profile.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                  { label: "Referral Code", value: detail.profile.referral_code ?? "—" },
                  { label: "Last Visit", value: detail.profile.last_visit_date ?? "—" },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-0.5">{f.label}</p>
                    <p className="text-[#1C1C1C] font-medium font-mono">{f.value}</p>
                  </div>
                ))}
                {/* Birthday with countdown */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-0.5">Birthday</p>
                  {(() => {
                    const b = birthdayInfo(detail.profile.birthday);
                    if (!b) return <p className="text-neutral-300 font-mono">—</p>;
                    const { display, countdown } = b;
                    const cdText = countdown === 0 ? "🎂 Today!" : countdown === 1 ? "🎉 Tomorrow" : `${countdown}d away`;
                    return (
                      <p className="font-mono font-medium" style={{ color: countdown !== null && countdown <= 14 ? "#C9A84C" : "#1C1C1C" }}>
                        {display} <span className="text-[11px] text-neutral-400">· {cdText}</span>
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Re-link bookings */}
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-3">
                <button
                  onClick={relinkBookings}
                  disabled={relinking}
                  className="text-[11px] px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-40"
                >
                  {relinking ? "Linking…" : "Re-link Bookings"}
                </button>
                {relinkMsg && (
                  <p className={`text-[11px] ${relinkMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                    {relinkMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Points", value: `${detail.profile.points_balance}` },
                { label: "Total Spent", value: `$${detail.profile.total_spend_all_time.toFixed(0)}` },
                { label: "Visits", value: `${detail.profile.total_visits_all_time}` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-neutral-100 p-3 text-center">
                  <p className="text-[18px] font-bold text-[#1C1C1C]">{s.value}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Award points — collapsible */}
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <button
                onClick={() => setShowAwardPanel(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <p className="text-[13px] font-bold text-[#1C1C1C]">Award / Adjust Points</p>
                <span className="text-neutral-400 text-[12px]">{showAwardPanel ? "▲" : "▼"}</span>
              </button>
              {showAwardPanel && (
                <div className="px-5 pb-5 space-y-3 border-t border-neutral-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Amount</label>
                      <input
                        value={awardAmount}
                        onChange={e => setAwardAmount(e.target.value)}
                        placeholder="e.g. 150 or -50"
                        type="number"
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Type</label>
                      <select
                        value={awardType}
                        onChange={e => setAwardType(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white"
                      >
                        <option value="purchase_earned">Purchase Earned</option>
                        <option value="birthday_bonus">Birthday Bonus</option>
                        <option value="referral_reward">Referral Reward</option>
                        <option value="promotion_bonus">Promotion</option>
                        <option value="manual_adjustment">Manual Adjustment</option>
                        <option value="redemption">Redemption</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Notes (optional)</label>
                    <input
                      value={awardNotes}
                      onChange={e => setAwardNotes(e.target.value)}
                      placeholder="e.g. Classic Full Set $120"
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  {awardMsg && (
                    <p className={`text-[12px] font-semibold ${awardMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                      {awardMsg}
                    </p>
                  )}
                  <button
                    onClick={awardPoints}
                    disabled={awarding || !awardAmount}
                    className="w-full py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40"
                  >
                    {awarding ? "Processing…" : "Confirm"}
                  </button>
                </div>
              )}
            </div>

            {/* Issue coupon — collapsible */}
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <button
                onClick={() => setShowIssueCouponPanel(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <p className="text-[13px] font-bold text-[#1C1C1C]">Issue Coupon</p>
                <span className="text-neutral-400 text-[12px]">{showIssueCouponPanel ? "▲" : "▼"}</span>
              </button>
              {showIssueCouponPanel && (
                <div className="px-5 pb-5 border-t border-neutral-100 pt-4">
                  {couponTemplates.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-[12px] text-neutral-400 mb-2">No coupon templates yet.</p>
                      <button
                        onClick={seedCoupons}
                        disabled={seeding}
                        className="text-[12px] text-[#C9A84C] hover:underline disabled:opacity-40"
                      >
                        {seeding ? "Creating…" : "Create default templates"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Coupon</label>
                        <select
                          value={issueCouponId}
                          onChange={e => setIssueCouponId(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white"
                        >
                          {couponTemplates.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({discountLabel(t)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Notes (optional)</label>
                        <input
                          value={issueCouponNotes}
                          onChange={e => setIssueCouponNotes(e.target.value)}
                          placeholder="e.g. Loyalty reward"
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                        />
                      </div>
                      {issueMsg && (
                        <p className={`text-[12px] font-semibold ${issueMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                          {issueMsg}
                        </p>
                      )}
                      <button
                        onClick={issueCoupon}
                        disabled={issuing || !issueCouponId}
                        className="w-full py-2.5 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40"
                      >
                        {issuing ? "Issuing…" : "Issue Coupon"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Member's coupons */}
            {detail.coupons.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-[13px] font-bold text-[#1C1C1C]">Coupons</p>
                </div>
                <div className="divide-y divide-neutral-50">
                  {detail.coupons.map(mc => {
                    const isActive = mc.status === "available" || mc.status === "reserved";
                    return (
                      <div key={mc.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#1C1C1C] truncate">
                            {mc.coupons?.name ?? "Coupon"}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            {mc.coupons ? discountLabel(mc.coupons) : ""}
                            {mc.expires_at && ` · Exp ${new Date(mc.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            {mc.notes && ` · ${mc.notes}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-[10px] font-bold uppercase"
                            style={{
                              color: mc.status === "available" ? "#C9A84C"
                                : mc.status === "used" ? "#9CA3AF"
                                : mc.status === "expired" ? "#9CA3AF"
                                : "#6B7280",
                            }}
                          >
                            {mc.status}
                          </span>
                          {isActive && (
                            <button
                              onClick={() => redeemCoupon(mc.id)}
                              className="text-[10px] px-2 py-1 bg-[#1C1C1C] text-white rounded hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all"
                            >
                              Redeem
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lash Passport */}
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                <p className="text-[13px] font-bold text-[#1C1C1C]">Lash Passport</p>
                <button onClick={() => setShowLashForm(!showLashForm)}
                  className="text-[11px] text-[#C9A84C] hover:underline">
                  {showLashForm ? "Cancel" : "+ Add Record"}
                </button>
              </div>

              {showLashForm && (
                <div className="px-4 py-4 border-b border-neutral-100 space-y-3 bg-neutral-50">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "service_date", label: "Date", type: "date" },
                      { key: "service_type", label: "Service Type", placeholder: "New Full Set / Refill" },
                      { key: "material", label: "Material", placeholder: "Classic / Volume / Cashmere" },
                      { key: "style", label: "Style", placeholder: "Cat Eye / Doll Eye" },
                      { key: "length", label: "Length", placeholder: "10-13mm" },
                      { key: "curl", label: "Curl", placeholder: "C / D / L" },
                      { key: "lash_count", label: "Count", placeholder: "120", type: "number" },
                    ].map(f => (
                      <div key={f.key} className={f.key === "service_date" ? "col-span-2" : ""}>
                        <label className="block text-[9px] uppercase tracking-[0.1em] text-neutral-400 mb-1">{f.label}</label>
                        <input
                          type={f.type ?? "text"}
                          value={lashForm[f.key as keyof typeof lashForm]}
                          onChange={e => setLashForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C] bg-white"
                        />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Client Requests</label>
                      <input value={lashForm.client_requests}
                        onChange={e => setLashForm(p => ({ ...p, client_requests: e.target.value }))}
                        placeholder="What client asked for"
                        className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C] bg-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Technician Notes</label>
                      <input value={lashForm.technician_notes}
                        onChange={e => setLashForm(p => ({ ...p, technician_notes: e.target.value }))}
                        placeholder="Internal notes"
                        className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C] bg-white" />
                    </div>
                  </div>
                  {lashMsg && <p className={`text-[11px] font-semibold ${lashMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>{lashMsg}</p>}
                  <button onClick={saveLashRecord} disabled={savingLash}
                    className="w-full py-2 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                    {savingLash ? "Saving…" : "Save Lash Record"}
                  </button>
                </div>
              )}

              {lashMsg && !showLashForm && (
                <p className="px-4 py-2 text-[11px] text-green-600 font-semibold border-b border-neutral-100">{lashMsg}</p>
              )}

              {lashRecords.length === 0 ? (
                <p className="text-[12px] text-neutral-400 text-center py-6">No lash records yet</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {lashRecords.map(r => (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-semibold text-[#1C1C1C]">
                          {new Date(r.service_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        {r.service_type && <span className="text-[11px] text-neutral-400">{r.service_type}</span>}
                      </div>
                      <div className="flex gap-3 flex-wrap text-[11px] text-neutral-500">
                        {r.material && <span>{r.material}</span>}
                        {r.style && <span>· {r.style}</span>}
                        {r.length && <span>· {r.length}</span>}
                        {r.curl && <span>· {r.curl}</span>}
                        {r.lash_count && <span>· {r.lash_count}pcs</span>}
                      </div>
                      {r.technician_notes && (
                        <p className="text-[11px] text-neutral-400 mt-1 italic">{r.technician_notes}</p>
                      )}

                      {/* Photo section */}
                      <div className="mt-2">
                        {r.photo_url ? (
                          <div className="flex items-center gap-2 mt-1">
                            <a href={r.photo_url} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={r.photo_url} alt="Lash photo" className="w-16 h-16 object-cover rounded-lg border border-neutral-200" />
                            </a>
                            <label className="text-[11px] text-[#C9A84C] cursor-pointer hover:underline">
                              Replace photo
                              <input type="file" accept="image/*" className="hidden"
                                onChange={async e => {
                                  const file = e.target.files?.[0];
                                  if (!file || !selected) return;
                                  const fd = new FormData(); fd.append("photo", file);
                                  const res = await fetch(`/api/admin/members/${selected.id}/lash-records/${r.id}/photo`, {
                                    method: "POST", headers: { Authorization: `Bearer ${adminKey}` }, body: fd,
                                  });
                                  if (res.ok) {
                                    const d = await res.json();
                                    setLashRecords(prev => prev.map(lr => lr.id === r.id ? { ...lr, photo_url: d.photo_url } : lr));
                                  }
                                }} />
                            </label>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-[#C9A84C] cursor-pointer transition-colors mt-1">
                            <span>+ Upload photo</span>
                            <input type="file" accept="image/*" className="hidden"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file || !selected) return;
                                const fd = new FormData(); fd.append("photo", file);
                                const res = await fetch(`/api/admin/members/${selected.id}/lash-records/${r.id}/photo`, {
                                  method: "POST", headers: { Authorization: `Bearer ${adminKey}` }, body: fd,
                                });
                                if (res.ok) {
                                  const d = await res.json();
                                  setLashRecords(prev => prev.map(lr => lr.id === r.id ? { ...lr, photo_url: d.photo_url } : lr));
                                }
                              }} />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visit history */}
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-[13px] font-bold text-[#1C1C1C]">Visit History</p>
              </div>
              {(detail.bookings ?? []).length === 0 ? (
                <p className="text-[12px] text-neutral-400 text-center py-6">No visits yet</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {(detail.bookings ?? []).map(b => {
                    const statusColor: Record<string, string> = {
                      completed: "#22C55E", cancelled: "#EF4444", no_show: "#F59E0B", booked: "#C9A84C",
                    };
                    return (
                      <div key={b.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-[12px] font-medium text-[#1C1C1C]">
                            {b.service ?? "Appointment"}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {b.time && ` · ${b.time}`}
                          </p>
                        </div>
                        <div className="text-right">
                          {b.price != null && (
                            <p className="text-[12px] font-semibold text-[#1C1C1C]">${b.price}</p>
                          )}
                          <p className="text-[10px] font-medium mt-0.5 capitalize"
                            style={{ color: statusColor[b.status] ?? "#888" }}>
                            {b.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>

    {/* Edit member modal */}
    {editingMember && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-[#1C1C1C]">Edit Member</h3>
            <button onClick={() => setEditingMember(null)} className="text-neutral-300 hover:text-neutral-600 text-xl">✕</button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">First Name</label>
                <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Last Name</label>
                <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Phone</label>
              <input type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+15169022205"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              <p className="text-[10px] text-neutral-400 mt-0.5">Phone login will update automatically.</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Birthday</label>
              <input type="date" value={editForm.birthday} onChange={e => setEditForm(p => ({ ...p, birthday: e.target.value }))}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Member Number</label>
              <input value={editForm.member_id} onChange={e => setEditForm(p => ({ ...p, member_id: e.target.value }))}
                placeholder="YEE-00001  or  just  1"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C] font-mono" />
              <p className="text-[10px] text-neutral-400 mt-0.5">Enter &quot;1&quot; to auto-format as YEE-00001.</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Notes for Member</label>
              <textarea value={editForm.admin_notes} onChange={e => setEditForm(p => ({ ...p, admin_notes: e.target.value }))}
                placeholder="Visible to member on their dashboard (read-only)"
                rows={3}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C] resize-none" />
            </div>
          </div>

          {editError && <p className="text-[12px] text-red-500 mt-3">{editError}</p>}

          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditingMember(null)}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors">
              Cancel
            </button>
            <button onClick={saveEdit} disabled={editSaving}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
              {editSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete member modal */}
    {deletingMember && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 className="text-[16px] font-bold text-[#1C1C1C] mb-1">Delete Member</h3>
          <p className="text-[12px] text-neutral-500 mb-1">
            You are about to permanently delete:
          </p>
          <p className="text-[13px] font-semibold text-[#1C1C1C] mb-4">
            {deletingMember.first_name} {deletingMember.last_name} ({deletingMember.member_id})
          </p>
          <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">
            Admin Password to Confirm
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && confirmDelete()}
            placeholder="Enter admin password"
            autoFocus
            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-red-400 transition-colors mb-3"
          />
          {deleteError && <p className="text-[12px] text-red-500 mb-3">{deleteError}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setDeletingMember(null); setDeletePassword(""); setDeleteError(""); }}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteLoading || !deletePassword}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

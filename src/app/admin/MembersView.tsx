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
  total_spend_all_time: number;
  total_visits_all_time: number;
  last_visit_date: string | null;
  joined_at: string;
  referral_code: string | null;
  admin_notes: string | null;
};


type MemberPackage = {
  id: string;
  name: string;
  notes: string | null;
  purchase_date: string | null;
  use1_date: string | null;
  use2_date: string | null;
  use3_date: string | null;
};

type MemberBooking = {
  id: string;
  date: string;
  time: string | null;
  service: string | null;
  service_label: string | null;
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
  const [detail, setDetail] = useState<{ profile: Member; coupons: MemberCoupon[]; bookings: MemberBooking[]; packages: MemberPackage[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [couponTemplates, setCouponTemplates] = useState<CouponTemplate[]>([]);


  // Issue coupon state
  const [issueCouponId, setIssueCouponId] = useState("");
  const [issueCouponNotes, setIssueCouponNotes] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issueMsg, setIssueMsg] = useState("");

  // Re-link bookings (single member)
  const [relinking, setRelinking] = useState(false);
  const [relinkMsg, setRelinkMsg] = useState("");

  // Re-link all members
  const [relinkingAll, setRelinkingAll] = useState(false);
  const [relinkAllMsg, setRelinkAllMsg] = useState("");

  // Lash record

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
  const [showIssueCouponPanel, setShowIssueCouponPanel] = useState(false);

  // Add package inline form
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkgNotes, setNewPkgNotes] = useState("");
  const [newPkgDate, setNewPkgDate] = useState("");
  const [savingPkg, setSavingPkg] = useState(false);

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
    setIssueMsg(""); setRelinkMsg("");

    const detailRes = await fetch(`/api/admin/members/${m.id}`, { headers: { Authorization: `Bearer ${adminKey}` } });
    const data = await detailRes.json();
    setDetail(data);
    setDetailLoading(false);
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

  async function relinkAllMembers() {
    setRelinkingAll(true); setRelinkAllMsg("");
    const res = await fetch("/api/admin/relink-all-members", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}` },
    });
    const d = await res.json();
    setRelinkingAll(false);
    if (res.ok) {
      const errSuffix = d.insertErrors?.length ? ` · ⚠ ${d.insertErrors[0]}` : "";
      setRelinkAllMsg(`✓ ${d.linked} linked · ${d.notesSynced} notes synced${errSuffix}`);
      search(query);
      if (selected) await loadDetail(selected);
    } else {
      setRelinkAllMsg(`Error: ${d.error}`);
    }
    setTimeout(() => setRelinkAllMsg(""), 5000);
  }

  async function addPackageForMember() {
    if (!selected || !detail) return;
    setSavingPkg(true);
    const res = await fetch("/api/admin/packages", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${detail.profile.first_name} ${detail.profile.last_name}`.trim(),
        phone: detail.profile.phone ?? "",
        notes: newPkgNotes || null,
        purchase_date: newPkgDate || null,
      }),
    });
    setSavingPkg(false);
    if (res.ok) {
      const pkg = await res.json();
      setDetail(d => d ? { ...d, packages: [pkg, ...d.packages] } : d);
      setShowAddPackage(false);
      setNewPkgNotes(""); setNewPkgDate("");
    }
  }

  async function togglePackageSession(pkgId: string, slot: 1 | 2 | 3) {
    if (!detail) return;
    const pkg = detail.packages.find(p => p.id === pkgId);
    if (!pkg) return;
    const key = `use${slot}_date` as "use1_date" | "use2_date" | "use3_date";
    const newVal = pkg[key] ? null : new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    setDetail(d => d ? { ...d, packages: d.packages.map(p => p.id === pkgId ? { ...p, [key]: newVal } : p) } : d);
    await fetch(`/api/admin/packages/${pkgId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: newVal }),
    });
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
      admin_notes:  m.admin_notes ?? "",
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
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-bold text-[#1C1C1C]">Members</h2>
            <button
              onClick={relinkAllMembers}
              disabled={relinkingAll}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-[#C9A84C] hover:text-white transition-colors text-neutral-500 disabled:opacity-40"
              title="Re-link bookings and sync notes for all members"
            >
              {relinkingAll ? "Syncing…" : "↻ Sync All"}
            </button>
          </div>
          {relinkAllMsg && (
            <p className={`text-[10px] text-center mb-2 ${relinkAllMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
              {relinkAllMsg}
            </p>
          )}
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
                { label: "Visits", value: `${detail.profile.total_visits_all_time}` },
                { label: "Progress", value: `${detail.profile.total_visits_all_time % 5}/5` },
                { label: "Total Spent", value: `$${detail.profile.total_spend_all_time.toFixed(0)}` },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-neutral-100 p-3 text-center">
                  <p className="text-[18px] font-bold text-[#1C1C1C]">{s.value}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-xl border border-neutral-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-bold text-[#1C1C1C]">Notes for Member</p>
                <button
                  onClick={() => openEdit(detail.profile)}
                  className="text-[11px] text-[#C9A84C] hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
              {detail.profile.admin_notes ? (
                <p className="text-[13px] text-[#1C1C1C] whitespace-pre-wrap">{detail.profile.admin_notes}</p>
              ) : (
                <p className="text-[12px] text-neutral-300 italic">No notes yet</p>
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

            {/* 3x Package */}
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                <p className="text-[13px] font-bold text-[#1C1C1C]">3× Package</p>
                <button
                  onClick={() => { setShowAddPackage(p => !p); setNewPkgNotes(""); setNewPkgDate(""); }}
                  className="text-[11px] font-semibold text-[#C9A84C] hover:underline"
                >
                  {showAddPackage ? "Cancel" : "+ Add"}
                </button>
              </div>

              {/* Inline add form */}
              {showAddPackage && (
                <div className="px-4 py-3 border-b border-neutral-100 space-y-2 bg-neutral-50">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Service / Notes</label>
                    <input
                      value={newPkgNotes}
                      onChange={e => setNewPkgNotes(e.target.value)}
                      placeholder="e.g. 120 pic · $290"
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={newPkgDate}
                      onChange={e => setNewPkgDate(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <button
                    onClick={addPackageForMember}
                    disabled={savingPkg}
                    className="w-full py-2 bg-[#1C1C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40"
                  >
                    {savingPkg ? "Saving…" : "Add Package"}
                  </button>
                </div>
              )}

              {(detail.packages ?? []).length === 0 && !showAddPackage ? (
                <p className="text-[12px] text-neutral-400 text-center py-5">No packages</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {(detail.packages ?? []).map(pkg => {
                    const used = [pkg.use1_date, pkg.use2_date, pkg.use3_date].filter(Boolean).length;
                    const done = used === 3;
                    const fmtD = (d: string | null) => d
                      ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : null;
                    return (
                      <div key={pkg.id} className={`px-4 py-3 ${done ? "opacity-60" : ""}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-[12px] font-semibold text-[#1C1C1C]">{pkg.notes || pkg.name}</p>
                            {pkg.purchase_date && (
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                Purchased {fmtD(pkg.purchase_date)}
                              </p>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            done ? "bg-neutral-100 text-neutral-400" : "bg-amber-50 text-amber-700"
                          }`}>
                            {done ? "Completed" : `${3 - used} left`}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {([1, 2, 3] as const).map(slot => {
                            const key = `use${slot}_date` as "use1_date" | "use2_date" | "use3_date";
                            const dateVal = pkg[key];
                            const prevKey = slot === 2 ? "use1_date" : slot === 3 ? "use2_date" : null;
                            const prevFilled = !prevKey || !!pkg[prevKey as keyof MemberPackage];
                            const canCheck = !dateVal && prevFilled;
                            return (
                              <div key={slot} className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => togglePackageSession(pkg.id, slot)}
                                  disabled={!dateVal && !canCheck}
                                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all text-[11px] font-bold
                                    ${dateVal
                                      ? "bg-[#1C1C1C] border-[#1C1C1C] text-white"
                                      : canCheck
                                        ? "border-neutral-300 hover:border-[#C9A84C] hover:bg-amber-50 text-neutral-400"
                                        : "border-neutral-100 bg-neutral-50 text-neutral-200 cursor-not-allowed"
                                    }`}>
                                  {dateVal
                                    ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    : slot}
                                </button>
                                <span className="text-[9px] text-neutral-400 text-center leading-tight">
                                  {fmtD(dateVal) ?? `#${slot}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                            {b.service_label ?? b.service ?? "Appointment"}
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

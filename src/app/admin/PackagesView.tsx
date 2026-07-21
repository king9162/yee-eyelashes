"use client";

import { useState, useEffect, useRef } from "react";

type Package = {
  id:            string;
  name:          string;
  phone:         string | null;
  notes:         string | null;
  purchase_date: string | null;
  use1_date:     string | null;
  use2_date:     string | null;
  use3_date:     string | null;
  created_at:    string;
};

type ClientSuggestion = {
  name:  string;
  phone: string;
};

const EMPTY: Omit<Package, "id" | "created_at"> = {
  name: "", phone: "", notes: "", purchase_date: "",
  use1_date: null, use2_date: null, use3_date: null,
};

function todayET(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function fmtDate(d: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}
function fmtShortDate(d: string | null): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

export default function PackagesView({ adminKey }: { adminKey: string }) {
  const [packages,    setPackages]    = useState<Package[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState<"add" | "edit" | null>(null);
  const [draft,       setDraft]       = useState<Omit<Package, "id" | "created_at">>(EMPTY);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState("");
  const [allClients,  setAllClients]  = useState<ClientSuggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);

  const headers = { Authorization: `Bearer ${adminKey}` };

  async function load() {
    setLoading(true);
    const [pkgRes, cliRes] = await Promise.all([
      fetch("/api/admin/packages", { headers }),
      fetch("/api/clients",        { headers }),
    ]);
    if (pkgRes.ok) setPackages(await pkgRes.json());
    if (cliRes.ok) {
      const raw: { first_name: string; last_name: string; phone: string }[] = await cliRes.json();
      // Deduplicate by normalised phone, keep fullest name
      const map = new Map<string, ClientSuggestion>();
      for (const c of raw) {
        const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
        const key = (c.phone ?? "").replace(/\D/g, "").slice(-10) || fullName.toLowerCase();
        if (!map.has(key)) map.set(key, { name: fullName, phone: c.phone ?? "" });
        else if (fullName.length > map.get(key)!.name.length) map.get(key)!.name = fullName;
      }
      setAllClients([...map.values()].filter(c => c.name).sort((a, b) => a.name.localeCompare(b.name)));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [adminKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close suggestion dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (nameRef.current && !nameRef.current.contains(e.target as Node)) setShowSuggest(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = draft.name.trim().length > 0
    ? allClients.filter(c => c.name.toLowerCase().includes(draft.name.toLowerCase())).slice(0, 6)
    : [];

  async function toggleUse(pkg: Package, slot: 1 | 2 | 3) {
    const key = `use${slot}_date` as "use1_date" | "use2_date" | "use3_date";
    const current = pkg[key];
    // Must check in order: slot 2 requires slot 1 filled, slot 3 requires slot 2 filled
    if (!current) {
      const prev = slot === 2 ? pkg.use1_date : slot === 3 ? pkg.use2_date : null;
      if (slot > 1 && !prev) return; // can't skip
    }
    const newVal = current ? null : todayET();
    const updated = { ...pkg, [key]: newVal };
    setPackages(prev => prev.map(p => p.id === pkg.id ? updated : p));
    await fetch(`/api/admin/packages/${pkg.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: newVal }),
    });
  }

  async function saveModal() {
    if (!draft.name.trim()) return;
    setSaving(true);
    if (modal === "add") {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) { const p = await res.json(); setPackages(prev => [p, ...prev]); }
    } else if (modal === "edit" && editId) {
      const res = await fetch(`/api/admin/packages/${editId}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) { const p = await res.json(); setPackages(prev => prev.map(x => x.id === editId ? p : x)); }
    }
    setSaving(false);
    setModal(null);
  }

  async function deletePkg(pkg: Package) {
    if (!confirm(`Delete package for ${pkg.name}?`)) return;
    await fetch(`/api/admin/packages/${pkg.id}`, { method: "DELETE", headers });
    setPackages(prev => prev.filter(p => p.id !== pkg.id));
  }

  function openEdit(pkg: Package) {
    setDraft({ name: pkg.name, phone: pkg.phone ?? "", notes: pkg.notes ?? "",
      purchase_date: pkg.purchase_date ?? "",
      use1_date: pkg.use1_date, use2_date: pkg.use2_date, use3_date: pkg.use3_date });
    setEditId(pkg.id);
    setModal("edit");
  }

  const filtered = packages.filter(p =>
    !search || [p.name, p.phone, p.notes]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const usedCount = (p: Package) =>
    [p.use1_date, p.use2_date, p.use3_date].filter(Boolean).length;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[22px] font-bold text-[#1C1C1C]">3 Times Package</h2>
          <p className="text-[12px] text-neutral-400 mt-0.5">{packages.length} package{packages.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => { setDraft(EMPTY); setModal("add"); }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C1C1C] text-white text-[12px] font-bold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
          <span className="text-[18px] leading-none font-light">+</span> Add Package
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#C9A84C] bg-white"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total",    value: packages.length },
          { label: "Active",   value: packages.filter(p => usedCount(p) < 3).length },
          { label: "Finished", value: packages.filter(p => usedCount(p) === 3).length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-1">{s.label}</p>
            <p className="text-[28px] font-bold text-[#1C1C1C] leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Loading / empty */}
      {loading && <p className="bg-white border border-neutral-200 rounded-xl px-5 py-10 text-center text-[13px] text-neutral-300">Loading…</p>}
      {!loading && filtered.length === 0 && (
        <p className="bg-white border border-neutral-200 rounded-xl px-5 py-10 text-center text-[13px] text-neutral-300">
          {search ? "No results" : "No packages yet. Tap + Add Package to start."}
        </p>
      )}

      {/* Mobile cards — hidden on sm+ */}
      {!loading && filtered.length > 0 && (
        <div className="sm:hidden space-y-3">
          {filtered.map(pkg => {
            const used = usedCount(pkg);
            const done = used === 3;
            return (
              <div key={pkg.id} className={`bg-white border border-neutral-200 rounded-xl p-4 ${done ? "opacity-60" : ""}`}>
                {/* Top row: name + edit */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[16px] font-bold text-[#1C1C1C]">{pkg.name}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      done ? "bg-neutral-100 text-neutral-500" : used === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {done ? "Completed" : `${3 - used} left`}
                    </span>
                  </div>
                  <button onClick={() => openEdit(pkg)}
                    className="text-[13px] font-semibold text-[#1C1C1C] px-2 py-1">
                    Edit
                  </button>
                </div>

                {/* Info rows */}
                <div className="space-y-1 mb-4">
                  {pkg.phone && (
                    <p className="text-[13px] text-[#1C1C1C]"><span className="text-neutral-400 text-[11px] uppercase tracking-[0.08em] mr-2">Phone</span>{pkg.phone}</p>
                  )}
                  {pkg.purchase_date && (
                    <p className="text-[13px] text-[#1C1C1C]"><span className="text-neutral-400 text-[11px] uppercase tracking-[0.08em] mr-2">Bought</span>{fmtDate(pkg.purchase_date)}</p>
                  )}
                  {pkg.notes && (
                    <div>
                      <span className="text-neutral-400 text-[11px] uppercase tracking-[0.08em]">Notes</span>
                      <p className="text-[13px] text-[#1C1C1C] whitespace-pre-line mt-0.5">{pkg.notes}</p>
                    </div>
                  )}
                </div>

                {/* Sessions — large tap targets, grid ensures equal column widths */}
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map(slot => {
                    const dateKey = `use${slot}_date` as keyof Package;
                    const dateVal = pkg[dateKey] as string | null;
                    const prevKey = slot === 2 ? "use1_date" : slot === 3 ? "use2_date" : null;
                    const prevFilled = !prevKey || !!pkg[prevKey as keyof Package];
                    const canCheck = !dateVal && prevFilled;
                    return (
                      <div key={slot} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => toggleUse(pkg, slot)}
                          disabled={!dateVal && !canCheck}
                          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all
                            ${dateVal
                              ? "bg-[#1C1C1C] border-[#1C1C1C] text-white"
                              : canCheck
                                ? "border-neutral-300 active:border-[#C9A84C] active:bg-amber-50"
                                : "border-neutral-100 bg-neutral-50 cursor-not-allowed"
                            }`}>
                          {dateVal
                            ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            : <span className="text-[13px] font-bold text-neutral-300">{slot}</span>
                          }
                        </button>
                        <span className="text-[10px] font-medium text-[#1C1C1C] text-center leading-tight min-h-[28px]">
                          {dateVal ? fmtDate(dateVal) : `Session ${slot}`}
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

      {/* Desktop table — hidden on mobile */}
      {!loading && filtered.length > 0 && (
        <div className="hidden sm:block bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {["Client","Phone","Purchased","Notes","Sessions",""].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-[#1C1C1C] px-4 py-3 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(pkg => {
                  const used = usedCount(pkg);
                  const done = used === 3;
                  return (
                    <tr key={pkg.id} className={`hover:bg-neutral-50 transition-colors ${done ? "opacity-60" : ""}`}>
                      <td className="px-4 py-4">
                        <p className="text-[15px] font-bold text-[#1C1C1C]">{pkg.name}</p>
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                          done ? "bg-neutral-100 text-neutral-500" : used === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {done ? "Completed" : `${3 - used} left`}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#1C1C1C]">{pkg.phone || "—"}</td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#1C1C1C] whitespace-nowrap">{fmtDate(pkg.purchase_date) || "—"}</td>
                      <td className="px-4 py-4 text-[14px] font-medium text-[#1C1C1C] max-w-[200px]">
                        <span className="whitespace-pre-line">{pkg.notes || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-3 gap-2 w-[150px]">
                          {([1, 2, 3] as const).map(slot => {
                            const dateKey = `use${slot}_date` as keyof Package;
                            const dateVal = pkg[dateKey] as string | null;
                            const prevKey = slot === 2 ? "use1_date" : slot === 3 ? "use2_date" : null;
                            const prevFilled = !prevKey || !!pkg[prevKey as keyof Package];
                            const canCheck = !dateVal && prevFilled;
                            return (
                              <div key={slot} className="flex flex-col items-center gap-0.5">
                                <button
                                  onClick={() => toggleUse(pkg, slot)}
                                  disabled={!dateVal && !canCheck}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                                    ${dateVal
                                      ? "bg-[#1C1C1C] border-[#1C1C1C] text-white"
                                      : canCheck
                                        ? "border-neutral-300 hover:border-[#C9A84C] hover:bg-amber-50"
                                        : "border-neutral-100 bg-neutral-50 cursor-not-allowed"
                                    }`}>
                                  {dateVal && (
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  )}
                                </button>
                                <span
                                  title={dateVal ? fmtDate(dateVal) : undefined}
                                  className="text-[9px] font-medium text-[#1C1C1C] text-center leading-tight whitespace-nowrap">
                                  {dateVal ? fmtShortDate(dateVal) : `#${slot}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(pkg)}
                          className="text-[13px] font-semibold text-[#1C1C1C] hover:text-[#C9A84C] transition-colors px-2">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl overflow-y-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1C1C1C]">
                {modal === "add" ? "New Package" : "Edit Package"}
              </h3>
              <button onClick={() => setModal(null)} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Name — with client autocomplete */}
              <div ref={nameRef} className="relative">
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Client Name *</label>
                <input
                  value={draft.name}
                  onChange={e => { setDraft(p => ({ ...p, name: e.target.value })); setShowSuggest(true); }}
                  onFocus={() => setShowSuggest(true)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="Type to search clients…"
                  autoComplete="off"
                />
                {showSuggest && suggestions.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setDraft(p => ({ ...p, name: c.name, phone: c.phone }));
                          setShowSuggest(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 active:bg-neutral-100 border-b border-neutral-50 last:border-0 transition-colors">
                        <p className="text-[14px] font-semibold text-[#1C1C1C]">{c.name}</p>
                        {c.phone && <p className="text-[12px] text-neutral-400">{c.phone}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Phone</label>
                <input value={draft.phone ?? ""} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]"
                  placeholder="631-902-0852" />
              </div>
              {/* Purchase date */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Purchase Date</label>
                <input type="date" value={draft.purchase_date ?? ""} onChange={e => setDraft(p => ({ ...p, purchase_date: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
              </div>
              {/* Notes */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Notes (service, price, etc.)</label>
                <textarea value={draft.notes ?? ""} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#C9A84C] resize-none"
                  placeholder="e.g. 120 pic · $290" />
              </div>
              {/* Usage dates — only in edit mode */}
              {modal === "edit" && (
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-neutral-400 mb-2">Session Dates</label>
                  <div className="space-y-2">
                    {([1, 2, 3] as const).map(slot => {
                      const key = `use${slot}_date` as "use1_date" | "use2_date" | "use3_date";
                      return (
                        <div key={slot} className="flex items-center gap-3">
                          <span className="text-[12px] text-neutral-500 w-16">Session {slot}</span>
                          <input type="date" value={draft[key] ?? ""}
                            onChange={e => setDraft(p => ({ ...p, [key]: e.target.value || null }))}
                            className="flex-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#C9A84C]" />
                          {draft[key] && (
                            <button onClick={() => setDraft(p => ({ ...p, [key]: null }))}
                              className="text-[11px] text-neutral-300 hover:text-red-400">✕</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center">
              {modal === "edit" && editId && (
                <button
                  onClick={async () => {
                    const pkg = packages.find(p => p.id === editId);
                    if (!pkg) return;
                    await deletePkg(pkg);
                    setModal(null);
                  }}
                  className="text-[13px] font-semibold text-red-400 hover:text-red-600 transition-colors">
                  Delete Package
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setModal(null)}
                  className="px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors">
                  Cancel
                </button>
                <button onClick={saveModal} disabled={saving || !draft.name.trim()}
                  className="px-5 py-2 bg-[#1C1C1C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                  {saving ? "Saving…" : modal === "add" ? "Add Package" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

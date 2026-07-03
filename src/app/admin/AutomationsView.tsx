"use client";

import { useState, useEffect } from "react";

type AutomationRow = {
  id:          string;
  name:        string;
  description: string;
  defaultOn:   boolean;
  channel:     "email" | "sms";
};

const AUTOMATIONS: AutomationRow[] = [
  { id: "refill-email",   channel: "email", name: "Refill Reminder",     defaultOn: true,
    description: "Win back customers who haven't booked in the last 2 weeks" },
  { id: "refill-sms",     channel: "sms",   name: "Refill Reminder SMS", defaultOn: false,
    description: "Send a text reminder to clients who haven't rebooked in a while" },
  { id: "review-email",   channel: "email", name: "Google Reviews",      defaultOn: true,
    description: "Ask customers for a Google review the day after their appointment" },
  { id: "review-sms",     channel: "sms",   name: "Google Reviews SMS",  defaultOn: false,
    description: "Send a text asking for a Google review the day after their appointment" },
  { id: "birthday-email", channel: "email", name: "Birthday Wish",       defaultOn: true,
    description: "Send a birthday email with 20% off discount on the client's birthday" },
  { id: "birthday-sms",   channel: "sms",   name: "Birthday Wish SMS",   defaultOn: false,
    description: "Send a birthday text with 20% off discount on the client's birthday" },
];

type ActionEntry = {
  client_id:   string;
  action_type: string;
  sent_at:     string;
  created_at:  string;
};

type ClientEntry = {
  id:         string;
  first_name: string;
  last_name:  string;
  phone:      string;
};

type BookingWithSend = {
  id:             string;
  name:           string;
  phone:          string;
  email:          string;
  review_sent_at: string | null;
  refill_sent_at: string | null;
};

type HistoryEntry = {
  key:         string;
  name:        string;
  phone?:      string;
  action_type: string;
  sent_at:     string;
  created_at:  string;
  source:      "manual" | "auto";
  client_id?:  string;
  index?:      number;
};

export default function AutomationsView({ adminKey }: { adminKey: string }) {
  const [settings,        setSettings]        = useState<Record<string, boolean>>({});
  const [refillDays,      setRefillDays]      = useState(14);
  const [history,         setHistory]         = useState<ActionEntry[]>([]);
  const [clients,         setClients]         = useState<ClientEntry[]>([]);
  const [bookingsWithSends, setBookingsWithSends] = useState<BookingWithSend[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [showLog,         setShowLog]         = useState(true);
  const [saving,          setSaving]          = useState<string | null>(null);
  const [savingDays,      setSavingDays]      = useState(false);

  const headers = { Authorization: `Bearer ${adminKey}` };

  useEffect(() => {
    async function load() {
      const [sRes, aRes, cRes, bRes] = await Promise.all([
        fetch("/api/admin/settings",        { headers }),
        fetch("/api/admin/client-actions",  { headers }),
        fetch("/api/clients",               { headers }),
        fetch("/api/bookings",              { headers }),
      ]);
      if (sRes.ok) {
        const rows: { key: string; value: string }[] = await sRes.json();
        const map: Record<string, boolean> = {};
        for (const r of rows) {
          if (r.key === "refill_days") { setRefillDays(parseInt(r.value) || 14); }
          else { map[r.key] = r.value === "true"; }
        }
        setSettings(map);
      }
      if (aRes.ok) setHistory(await aRes.json());
      if (cRes.ok) setClients(await cRes.json());
      if (bRes.ok) {
        const all: BookingWithSend[] = await bRes.json();
        setBookingsWithSends(all.filter(b => b.review_sent_at || b.refill_sent_at));
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  async function saveRefillDays(days: number) {
    setSavingDays(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ key: "refill_days", value: String(days) }),
    });
    setSavingDays(false);
  }

  async function toggle(id: string) {
    const newVal = !(settings[id] ?? AUTOMATIONS.find(a => a.id === id)?.defaultOn ?? false);
    setSettings(prev => ({ ...prev, [id]: newVal }));
    setSaving(id);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ key: id, value: String(newVal) }),
    });
    setSaving(null);
  }

  function isActive(id: string) {
    if (id in settings) return settings[id];
    return AUTOMATIONS.find(a => a.id === id)?.defaultOn ?? false;
  }

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  // Build combined history: manual (client_actions) + auto (bookings sent_at fields)
  const manualEntries: HistoryEntry[] = history
    .filter(a => ["review-email","review-sms","refill-email","refill-sms"].includes(a.action_type))
    .map((e, i) => {
      const c = clientMap[e.client_id];
      return {
        key:         `manual-${e.client_id}-${e.action_type}`,
        name:        c ? `${c.first_name} ${c.last_name}`.trim() || c.first_name : e.client_id.slice(0, 8),
        phone:       c?.phone,
        action_type: e.action_type,
        sent_at:     e.sent_at,
        created_at:  e.created_at,
        source:      "manual" as const,
        client_id:   e.client_id,
        index:       i,
      };
    });

  const autoEntries: HistoryEntry[] = bookingsWithSends.flatMap(b => {
    const entries: HistoryEntry[] = [];
    if (b.review_sent_at) entries.push({
      key:         `auto-${b.id}-review`,
      name:        b.name,
      phone:       b.phone,
      action_type: "review-email",
      sent_at:     b.review_sent_at.split("T")[0],
      created_at:  b.review_sent_at,
      source:      "auto" as const,
    });
    if (b.refill_sent_at) entries.push({
      key:         `auto-${b.id}-refill`,
      name:        b.name,
      phone:       b.phone,
      action_type: "refill-email",
      sent_at:     b.refill_sent_at.split("T")[0],
      created_at:  b.refill_sent_at,
      source:      "auto" as const,
    });
    return entries;
  });

  const combinedHistory = [...manualEntries, ...autoEntries]
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const TYPE_LABELS: Record<string, string> = {
    "review-email":   "Review Email",
    "review-sms":     "Review SMS",
    "refill-email":   "Refill Email",
    "refill-sms":     "Refill SMS",
    "birthday-email": "Birthday Email",
    "birthday-sms":   "Birthday SMS",
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-neutral-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-bold text-[#1C1C1C]">Automations</h2>
      </div>

      {/* ── Active automations ── */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {["Automation","Channel","Status","Settings",""].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-neutral-400 px-5 py-3 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {AUTOMATIONS.map(a => {
              const on = isActive(a.id);
              return (
                <tr key={a.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[13px] font-semibold text-[#1C1C1C]">{a.name}</p>
                    <p className="text-[12px] text-neutral-400 mt-0.5 max-w-sm">{a.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    {a.channel === "sms" ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        SMS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Email
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${on ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {loading ? "…" : on ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {a.id === "refill-email" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min={1} max={90}
                          value={refillDays}
                          onChange={e => setRefillDays(parseInt(e.target.value) || 14)}
                          onBlur={e => saveRefillDays(parseInt(e.target.value) || 14)}
                          className="w-16 border border-neutral-200 rounded-lg px-2 py-1 text-[13px] text-center focus:outline-none focus:border-[#C9A84C]"
                        />
                        <span className="text-[12px] text-neutral-400 whitespace-nowrap">
                          days {savingDays ? <span className="text-[#C9A84C]">✓</span> : ""}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggle(a.id)}
                      disabled={saving === a.id}
                      className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${on ? "bg-green-500" : "bg-neutral-300"}`}>
                      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${on ? "left-[23px]" : "left-[3px]"}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Message Templates ── */}
      <h3 className="text-[18px] font-bold text-[#1C1C1C] mb-4">Message Templates</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">

        {/* ── Refill Reminder Email ── */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">✉ Email</span>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Refill Reminder</span>
          </div>
          <div className="p-4">
            <div className="bg-[#f8f5ef] rounded-lg p-3 border border-neutral-100">
              <div className="bg-white rounded border border-neutral-100 overflow-hidden">
                <div className="h-[3px] bg-[#C9A84C]" />
                <div className="px-4 py-3 text-center border-b border-neutral-50">
                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#C9A84C]">Yee Eyelashes</p>
                  <p className="text-[14px] font-light text-[#1C1C1C] mt-0.5">Time for a Refill!</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-[10px] text-neutral-500 leading-relaxed">Hi <span className="font-medium text-[#1C1C1C]">[Name]</span>, it&apos;s been two weeks since your last lash appointment. Come in for a refill and keep your lashes looking full and beautiful!</p>
                  <div className="bg-[#fafaf8] border-l-2 border-[#C9A84C] px-3 py-2">
                    <p className="text-[7px] text-[#C9A84C] uppercase tracking-[0.2em]">Last Service</p>
                    <p className="text-[9px] text-[#1C1C1C]">[Service name]</p>
                  </div>
                  <div className="bg-[#1c1c1c] text-center py-2">
                    <span className="text-white text-[8px] tracking-[0.25em] uppercase">Book Your Refill</span>
                  </div>
                  <p className="text-[9px] text-neutral-400">📍 278 Plandome Rd, 2F, Manhasset, NY</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Sent {refillDays} days after last appointment</p>
          </div>
        </div>

        {/* ── Google Reviews Email ── */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">✉ Email</span>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Google Reviews</span>
          </div>
          <div className="p-4">
            <div className="bg-[#f8f5ef] rounded-lg p-3 border border-neutral-100">
              <div className="bg-white rounded border border-neutral-100 overflow-hidden">
                <div className="h-[3px] bg-[#C9A84C]" />
                <div className="px-4 py-3 text-center border-b border-neutral-50">
                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#C9A84C]">Yee Eyelashes</p>
                  <p className="text-[14px] font-light text-[#1C1C1C] mt-0.5">How was your experience?</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <div className="bg-[#fef9ec] border border-[#f0dfa0] rounded px-3 py-2">
                    <p className="text-[9px] font-semibold text-[#1C1C1C]">🎁 Get $10 off your next visit</p>
                    <p className="text-[9px] text-neutral-500 mt-0.5 leading-relaxed">Leave us a Google review and receive <strong>$10 off</strong> your next appointment!</p>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">Hi <span className="font-medium text-[#1C1C1C]">[Name]</span>, thank you for visiting Yee Eyelashes! We hope you loved your lashes. ✨</p>
                  <div className="bg-[#1c1c1c] text-center py-2">
                    <span className="text-white text-[8px] tracking-[0.25em] uppercase">Leave a Google Review ★</span>
                  </div>
                  <p className="text-[9px] text-neutral-400 text-center">It only takes 30 seconds!</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Sent 1 day after appointment</p>
          </div>
        </div>

        {/* ── Refill SMS ── */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">💬 SMS</span>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Refill Reminder SMS</span>
          </div>
          <div className="p-4">
            <div className="bg-[#f0f0f0] rounded-2xl p-3 space-y-1">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-[#1C1C1C] leading-relaxed">
                  Hi <span className="font-medium">[Name]</span>! It&apos;s been 2 weeks since your last lash appointment at Yee Eyelashes! Perfect time for a refill. Book now: square.site/yee 📍 278 Plandome Rd, Manhasset · 516-984-3859
                </p>
              </div>
              <p className="text-[9px] text-neutral-400 pl-1">From: (833) 634-5378</p>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Sent {refillDays} days after last appointment</p>
          </div>
        </div>

        {/* ── Review SMS ── */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">💬 SMS</span>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Google Reviews SMS</span>
          </div>
          <div className="p-4">
            <div className="bg-[#f0f0f0] rounded-2xl p-3 space-y-1">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-[#1C1C1C] leading-relaxed">
                  Hi <span className="font-medium">[Name]</span>! Thank you for your visit at Yee Eyelashes 🌸 We&apos;d love your feedback. Please leave us a Google review: g.page/r/CWoWnxubhGRzEAE/review 📍 278 Plandome Rd, Manhasset · 516-984-3859
                </p>
              </div>
              <p className="text-[9px] text-neutral-400 pl-1">From: (833) 634-5378</p>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Sent 1 day after appointment</p>
          </div>
        </div>

        {/* ── Birthday Email ── */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] bg-pink-50 text-pink-500 border border-pink-200 px-2 py-0.5 rounded-full">✉ Email</span>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Birthday Wish</span>
          </div>
          <div className="p-4">
            <div className="bg-[#f8f5ef] rounded-lg p-3 border border-neutral-100">
              <div className="bg-white rounded border border-neutral-100 overflow-hidden">
                <div className="h-[3px] bg-gradient-to-r from-[#C9A84C] to-[#e8c97a]" />
                <div className="px-4 py-3 text-center border-b border-neutral-50">
                  <p className="text-[7px] tracking-[0.35em] uppercase text-[#C9A84C]">Yee Eyelashes</p>
                  <p className="text-[14px] font-light text-[#1C1C1C] mt-0.5">🎂 Happy Birthday, [Name]!</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-[10px] text-neutral-500 leading-relaxed">Wishing you the most beautiful birthday! 🎉 Enjoy <span className="font-medium text-[#1C1C1C]">20% off any service</span> during your birthday month.</p>
                  <div className="bg-[#fef9ec] border border-[#f0dfa0] rounded px-3 py-2 text-center">
                    <p className="text-[9px] font-semibold text-[#C9A84C] uppercase tracking-[0.2em]">Birthday Gift</p>
                    <p className="text-[18px] font-bold text-[#1C1C1C]">20% OFF</p>
                    <p className="text-[8px] text-neutral-400">Valid all month · No code needed</p>
                  </div>
                  <div className="bg-[#1c1c1c] text-center py-2">
                    <span className="text-white text-[8px] tracking-[0.25em] uppercase">Book Your Birthday Lashes ✨</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Sent on client&apos;s birthday (manual or auto)</p>
          </div>
        </div>

        {/* ── Birthday SMS ── */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] bg-pink-50 text-pink-500 border border-pink-200 px-2 py-0.5 rounded-full">💬 SMS</span>
            <span className="text-[13px] font-semibold text-[#1C1C1C]">Birthday Wish SMS</span>
          </div>
          <div className="p-4">
            <div className="bg-[#f0f0f0] rounded-2xl p-3 space-y-1">
              <div className="bg-[#e5e5ea] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-[#1C1C1C] leading-relaxed">
                  🎂 Happy Birthday, <span className="font-medium">[Name]</span>! Celebrate with gorgeous lashes, enjoy 20% off any service this month at Yee Eyelashes 🎁 Book: square.site/appointments/... 📍 278 Plandome Rd, Manhasset · 516-984-3859
                </p>
              </div>
              <p className="text-[9px] text-neutral-400 pl-1">From: (833) 634-5378</p>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Sent on client&apos;s birthday (manual or auto)</p>
          </div>
        </div>

      </div>

      {/* ── Send History ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[18px] font-bold text-[#1C1C1C]">Send History</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (!confirm("Clear all auto-sent records? The cron will be able to resend to all clients.")) return;
              const res = await fetch("/api/admin/reset-sms-sent", {
                method: "POST",
                headers: { Authorization: `Bearer ${adminKey}` },
              });
              if (res.ok) {
                setBookingsWithSends([]);
              }
            }}
            className="text-[12px] text-red-400 hover:text-red-600 transition-colors">
            Reset Auto-Sent
          </button>
          <button onClick={() => setShowLog(p => !p)} className="text-[12px] text-neutral-400 hover:text-[#1C1C1C] transition-colors">
            {showLog ? "Hide" : "Show"} ({combinedHistory.length})
          </button>
        </div>
      </div>
      {showLog && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {combinedHistory.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-neutral-300">No sends logged yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {["Client","Type","Source","Sent",""].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-neutral-400 px-5 py-3 uppercase tracking-[0.08em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {combinedHistory.map((e) => (
                  <tr key={e.key} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-[13px] text-[#1C1C1C]">
                      {e.name}{e.phone ? ` · ${e.phone}` : ""}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        e.action_type === "review-email" ? "bg-blue-50 text-blue-600"
                        : e.action_type === "review-sms"  ? "bg-blue-50 text-blue-500"
                        : e.action_type === "refill-sms"  ? "bg-amber-50 text-amber-500"
                        : "bg-amber-50 text-amber-600"
                      }`}>
                        {TYPE_LABELS[e.action_type] ?? e.action_type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        e.source === "auto"
                          ? "bg-neutral-100 text-neutral-400"
                          : "bg-green-50 text-green-600"
                      }`}>
                        {e.source === "auto" ? "Auto" : "Manual"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-neutral-400">{e.sent_at}</td>
                    <td className="px-5 py-3 text-right">
                      {e.source === "manual" && e.client_id && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete this send record for ${e.name}?`)) return;
                            await fetch("/api/admin/client-actions", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
                              body: JSON.stringify({ client_id: e.client_id, action_type: e.action_type }),
                            });
                            setHistory(prev => prev.filter(h =>
                              !(h.client_id === e.client_id && h.action_type === e.action_type)
                            ));
                          }}
                          className="text-[11px] text-neutral-300 hover:text-red-400 transition-colors px-1"
                          title="Delete record">
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

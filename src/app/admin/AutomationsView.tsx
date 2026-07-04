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
    description: "Ask customers for a Google review the night of their appointment" },
  { id: "review-sms",     channel: "sms",   name: "Google Reviews SMS",  defaultOn: false,
    description: "Send a text asking for a Google review the night of their appointment" },
  { id: "birthday-email", channel: "email", name: "Birthday Wish",       defaultOn: false,
    description: "Auto-send a birthday email with 20% off on the client's birthday (9 AM)" },
  { id: "birthday-sms",   channel: "sms",   name: "Birthday Wish SMS",   defaultOn: false,
    description: "Auto-send a birthday text with 20% off on the client's birthday (9 AM)" },
];

type ActionEntry = {
  client_id:   string;
  action_type: string;
  sent_at:     string;
  created_at:  string;
};

type PreviewClient = { id: string; first_name: string; last_name: string; phone: string; email: string; channels: string[] };

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
  key:           string;
  name:          string;
  phone?:        string;
  action_type:   string;
  sent_at:       string;
  created_at:    string;
  source:        "manual" | "auto";
  client_id?:    string;
  booking_id?:   string;
  booking_field?: "review_sent_at" | "refill_sent_at";
  index?:        number;
};

function normDate(s: string): string {
  if (!s || s === "opted-out") return s;
  let d: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    d = new Date(s + "T12:00:00");
  } else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s)) {
    const [y, m, day] = s.split("/").map(Number);
    d = new Date(y, m - 1, day);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    return s; // already M/D/YYYY
  } else {
    return s;
  }
  if (isNaN(d.getTime())) return s;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function AutomationsView({ adminKey }: { adminKey: string }) {
  const [settings,        setSettings]        = useState<Record<string, boolean>>({});
  const [refillDays,      setRefillDays]      = useState(14);
  const [history,         setHistory]         = useState<ActionEntry[]>([]);
  const [clients,         setClients]         = useState<ClientEntry[]>([]);
  const [bookingsWithSends, setBookingsWithSends] = useState<BookingWithSend[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [showLog,         setShowLog]         = useState(true);
  const [showCronLog,     setShowCronLog]     = useState(false);
  const [preview,         setPreview]         = useState<{ review: PreviewClient[]; refill: PreviewClient[]; birthday: PreviewClient[]; date: string; refillTarget: string } | null>(null);
  const [loadingPreview,  setLoadingPreview]  = useState(false);
  const [saving,          setSaving]          = useState<string | null>(null);
  const [savingDays,      setSavingDays]      = useState(false);
  const [runningCron,     setRunningCron]     = useState<string | null>(null);
  const [blastMessage,    setBlastMessage]    = useState<string>("");
  const [blastClients,    setBlastClients]    = useState<{ id: string; first_name: string; last_name: string; phone: string }[] | null>(null);
  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set());
  const [loadingBlastList, setLoadingBlastList] = useState(false);
  const [sendingBlast,    setSendingBlast]    = useState(false);
  const [blastResult,     setBlastResult]     = useState<{ sent: number; failed: number } | null>(null);
  const [scheduledBlast,  setScheduledBlast]  = useState<{ message: string; sendAt: string; label: string } | null>(null);
  const [blastScheduleDate, setBlastScheduleDate] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [schedulingBlast, setSchedulingBlast] = useState(false);
  const [selectedPreset,  setSelectedPreset]  = useState<string | null>(null);

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
          else if (r.key === "scheduled_blast") {
            try { const b = JSON.parse(r.value); if (b?.sendAt) setScheduledBlast(b); } catch { /* ignore */ }
          } else { map[r.key] = r.value === "true"; }
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
    const iv = setInterval(async () => {
      const [aRes, bRes] = await Promise.all([
        fetch("/api/admin/client-actions", { headers }),
        fetch("/api/bookings",             { headers }),
      ]);
      if (aRes.ok) setHistory(await aRes.json());
      if (bRes.ok) {
        const all: BookingWithSend[] = await bRes.json();
        setBookingsWithSends(all.filter(b => b.review_sent_at || b.refill_sent_at));
      }
    }, 30_000);
    return () => clearInterval(iv);
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

  async function fetchPreview() {
    setLoadingPreview(true);
    const res = await fetch("/api/admin/preview-sends", { headers });
    if (res.ok) setPreview(await res.json());
    setLoadingPreview(false);
  }

  const BLAST_PRESETS = [
    {
      id: "independence-day",
      label: "🇺🇸 Independence Day",
      message: "Happy 4th of July! 🇺🇸🎆\n\nWishing you a fun, safe, and beautiful holiday! ❤️🤍💙\n\n— Yee Eyelashes",
    },
    {
      id: "christmas",
      label: "🎄 Christmas",
      message: "🎄 Merry Christmas from Yee Eyelashes! ✨ Wishing you a wonderful holiday season filled with joy and love. We can't wait to see you in the new year! 📍 278 Plandome Rd, Manhasset · 516-984-3859",
    },
    {
      id: "new-year",
      label: "🎊 New Year",
      message: "🎊 Happy New Year from Yee Eyelashes! 🥂 Wishing you a beautiful year ahead. We can't wait to see you soon! 📍 278 Plandome Rd, Manhasset · 516-984-3859",
    },
    {
      id: "thanksgiving",
      label: "🦃 Thanksgiving",
      message: "🦃 Happy Thanksgiving from Yee Eyelashes! We are grateful for your support and look forward to seeing you soon. 📍 278 Plandome Rd, Manhasset · 516-984-3859",
    },
  ];

  async function scheduleBlast() {
    if (!blastMessage.trim()) { alert("Message cannot be empty"); return; }
    if (!blastScheduleDate)   { alert("Please pick a date"); return; }
    const label = BLAST_PRESETS.find(p => p.id === selectedPreset)?.label ?? "Custom";
    if (!confirm(`Schedule "${label}" blast for ${blastScheduleDate} at 10 AM?\n\nThis will send to all clients at that time.`)) return;
    setSchedulingBlast(true);
    const payload = { message: blastMessage, sendAt: blastScheduleDate, label };
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ key: "scheduled_blast", value: JSON.stringify(payload) }),
    });
    setScheduledBlast(payload);
    setSchedulingBlast(false);
  }

  async function cancelScheduledBlast() {
    if (!confirm("Cancel the scheduled blast?")) return;
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ key: "scheduled_blast", value: "" }),
    });
    setScheduledBlast(null);
  }

  async function fetchBlastClients() {
    setLoadingBlastList(true);
    setBlastResult(null);
    const res = await fetch("/api/admin/send-holiday-blast", { headers });
    if (res.ok) {
      const { clients } = await res.json();
      setBlastClients(clients ?? []);
      setSelectedIds(new Set((clients ?? []).map((c: { id: string }) => c.id)));
    }
    setLoadingBlastList(false);
  }

  async function sendBlast() {
    if (!blastMessage.trim()) { alert("Message cannot be empty"); return; }
    if (selectedIds.size === 0) { alert("No clients selected"); return; }
    if (!confirm(`Send to ${selectedIds.size} selected clients? This cannot be undone.`)) return;
    setSendingBlast(true);
    setBlastResult(null);
    const res = await fetch("/api/admin/send-holiday-blast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ message: blastMessage, clientIds: [...selectedIds] }),
    });
    const data = await res.json().catch(() => ({}));
    setSendingBlast(false);
    if (!res.ok) { alert(`Failed: ${data.error ?? res.status}`); return; }
    setBlastResult({ sent: data.sent, failed: data.failed });
    setBlastClients(null);
    setSelectedIds(new Set());
    const aRes = await fetch("/api/admin/client-actions", { headers });
    if (aRes.ok) setHistory(await aRes.json());
  }

  async function runCron(type: "google-review" | "refill-reminder" | "birthday") {
    setRunningCron(type);
    const res = await fetch(`/api/cron/${type}`, { headers });
    const data = await res.json().catch(() => ({}));
    setRunningCron(null);
    if (!res.ok) { alert(`Cron failed: ${data.error ?? res.status}`); return; }
    alert(`Done — sent: ${data.sent ?? 0}, failed: ${data.failed ?? 0}`);
    // Refresh history
    const aRes = await fetch("/api/admin/client-actions", { headers });
    if (aRes.ok) setHistory(await aRes.json());
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

  const AUTO_ACTION_TYPES = new Set([
    "auto-review", "auto-review-email", "auto-review-sms",
    "auto-refill", "auto-refill-email", "auto-refill-sms",
    "auto-birthday-email", "auto-birthday-sms",
  ]);
  const ALL_SEND_TYPES = [
    "review-email","review-sms","refill-email","refill-sms",
    "birthday-email","birthday-sms",
    "auto-review","auto-review-email","auto-review-sms",
    "auto-refill","auto-refill-email","auto-refill-sms",
    "auto-birthday-email","auto-birthday-sms",
    "holiday-blast-sms",
  ];

  // Build combined history: client_actions + bookings sent_at fields
  const manualEntries: HistoryEntry[] = history
    .filter(a => ALL_SEND_TYPES.includes(a.action_type))
    .map((e, i) => {
      const c = clientMap[e.client_id];
      return {
        key:         `action-${e.client_id}-${e.action_type}`,
        name:        c ? `${c.first_name} ${c.last_name}`.trim() || c.first_name : e.client_id.slice(0, 8),
        phone:       c?.phone,
        action_type: e.action_type,
        sent_at:     e.sent_at,
        created_at:  e.created_at,
        source:      AUTO_ACTION_TYPES.has(e.action_type) ? "auto" as const : "manual" as const,
        client_id:   e.client_id,
        index:       i,
      };
    });

  // De-dupe: don't show booking-based auto entry if a client_action "auto-review/refill" already covers it
  const actionClientIds = new Set(
    history.filter(a => AUTO_ACTION_TYPES.has(a.action_type)).map(a => a.client_id)
  );
  const autoEntries: HistoryEntry[] = bookingsWithSends.flatMap(b => {
    const entries: HistoryEntry[] = [];
    const clientId = clients.find(c =>
      c.phone?.replace(/\D/g, "").slice(-10) === b.phone?.replace(/\D/g, "").slice(-10)
    )?.id;
    if (b.review_sent_at && !(clientId && actionClientIds.has(clientId))) entries.push({
      key:           `auto-${b.id}-review`,
      name:          b.name,
      phone:         b.phone,
      action_type:   "review-email",
      sent_at:       b.review_sent_at.split("T")[0],
      created_at:    b.review_sent_at,
      source:        "auto" as const,
      booking_id:    b.id,
      booking_field: "review_sent_at",
    });
    if (b.refill_sent_at && !(clientId && actionClientIds.has(clientId))) entries.push({
      key:           `auto-${b.id}-refill`,
      name:          b.name,
      phone:         b.phone,
      action_type:   "refill-email",
      sent_at:       b.refill_sent_at.split("T")[0],
      created_at:    b.refill_sent_at,
      source:        "auto" as const,
      booking_id:    b.id,
      booking_field: "refill_sent_at",
    });
    return entries;
  });

  const combinedHistory = [...manualEntries, ...autoEntries]
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Group auto-sends by the date they were created (= when cron ran)
  const cronHistory = Object.values(
    history
      .filter(a => a.action_type.startsWith("auto-"))
      .reduce((acc, a) => {
        const runDate = a.created_at?.split("T")[0] ?? a.sent_at;
        if (!acc[runDate]) acc[runDate] = { date: runDate, entries: [] };
        acc[runDate].entries.push(a);
        return acc;
      }, {} as Record<string, { date: string; entries: typeof history }>)
  ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const TYPE_LABELS: Record<string, string> = {
    "review-email":        "Review Email",
    "review-sms":          "Review SMS",
    "refill-email":        "Refill Email",
    "refill-sms":          "Refill SMS",
    "birthday-email":      "Birthday Email",
    "birthday-sms":        "Birthday SMS",
    "auto-review":         "Review (Auto)",
    "auto-review-email":   "Review Email (Auto)",
    "auto-review-sms":     "Review SMS (Auto)",
    "auto-refill":         "Refill (Auto)",
    "auto-refill-email":   "Refill Email (Auto)",
    "auto-refill-sms":     "Refill SMS (Auto)",
    "auto-birthday-email": "Birthday Email (Auto)",
    "auto-birthday-sms":   "Birthday SMS (Auto)",
    "holiday-blast-sms":   "Holiday Blast SMS",
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-neutral-50">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-[22px] font-bold text-[#1C1C1C]">Automations</h2>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={fetchPreview}
            disabled={loadingPreview}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 text-[12px] font-semibold rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-40">
            {loadingPreview ? "Loading…" : "Preview Tonight's Sends"}
          </button>
          <button
            onClick={() => runCron("google-review")}
            disabled={!!runningCron}
            className="px-4 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-40">
            {runningCron === "google-review" ? "Sending…" : "▶ Run Review Now"}
          </button>
          <button
            onClick={() => runCron("refill-reminder")}
            disabled={!!runningCron}
            className="px-4 py-2 bg-green-600 text-white text-[12px] font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-40">
            {runningCron === "refill-reminder" ? "Sending…" : "▶ Run Refill Now"}
          </button>
          <button
            onClick={() => runCron("birthday")}
            disabled={!!runningCron}
            className="px-4 py-2 bg-[#C9A84C] text-white text-[12px] font-semibold rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
            {runningCron === "birthday" ? "Sending…" : "▶ Run Birthday Now"}
          </button>
        </div>
      </div>

      {/* ── Tonight's Preview ── */}
      {preview && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-8">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-[#1C1C1C]">Tonight&apos;s Send Preview</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">{preview.date} · Refill target: {preview.refillTarget}</p>
            </div>
            <button onClick={() => setPreview(null)} className="text-neutral-300 hover:text-neutral-500 text-xl leading-none">✕</button>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Review", color: "blue", clients: preview.review },
              { label: "Refill", color: "amber", clients: preview.refill },
              { label: "Birthday", color: "pink", clients: preview.birthday },
            ].map(({ label, color, clients }) => (
              <div key={label}>
                <p className={`text-[10px] uppercase tracking-[0.15em] font-semibold mb-2 ${
                  color === "blue" ? "text-blue-500" : color === "amber" ? "text-amber-500" : "text-pink-500"
                }`}>{label} ({clients.length})</p>
                {clients.length === 0 ? (
                  <p className="text-[12px] text-neutral-300">None scheduled</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {clients.map(c => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-[12px] text-[#1C1C1C]">{`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()}</span>
                        <span className="text-[10px] text-neutral-400">{c.channels.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Holiday / Broadcast Blast ── */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#1C1C1C]">Holiday / Broadcast SMS</span>
          <span className="text-[11px] text-neutral-400">· Send a one-time message to all clients</span>
        </div>
        <div className="p-5 space-y-4">

          {/* Scheduled blast banner */}
          {scheduledBlast && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div>
                <p className="text-[12px] font-bold text-purple-700">⏰ Scheduled: {scheduledBlast.label}</p>
                <p className="text-[11px] text-purple-500 mt-0.5">Sending on {scheduledBlast.sendAt} at 10:00 AM</p>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{scheduledBlast.message}</p>
              </div>
              <button onClick={cancelScheduledBlast}
                className="shrink-0 text-[11px] font-semibold px-3 py-1.5 bg-white border border-purple-200 text-purple-500 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                Cancel
              </button>
            </div>
          )}

          {/* Event presets */}
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.1em] mb-2">Event Preset</p>
            <div className="flex flex-wrap gap-2">
              {BLAST_PRESETS.map(p => (
                <button key={p.id}
                  onClick={() => {
                    setSelectedPreset(p.id);
                    setBlastMessage(p.message);
                    setBlastClients(null);
                    setBlastResult(null);
                  }}
                  className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    selectedPreset === p.id
                      ? "bg-[#C9A84C] text-white border-[#C9A84C]"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-[#C9A84C] hover:text-[#C9A84C]"
                  }`}>
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => { setSelectedPreset("custom"); setBlastMessage(""); setBlastClients(null); setBlastResult(null); }}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedPreset === "custom"
                    ? "bg-neutral-700 text-white border-neutral-700"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400"
                }`}>
                ✏️ Custom
              </button>
            </div>
          </div>

          {/* Message editor */}
          <textarea
            value={blastMessage}
            onChange={e => { setBlastMessage(e.target.value); setBlastClients(null); setBlastResult(null); setSelectedPreset("custom"); }}
            rows={4}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13px] text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C] resize-none"
            placeholder="Select an event above or type a custom message…"
          />

          {/* Preview button */}
          <button
            onClick={fetchBlastClients}
            disabled={loadingBlastList || !blastMessage.trim()}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 text-[12px] font-semibold rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-40 w-fit">
            {loadingBlastList ? "Loading…" : "Preview Recipient List"}
          </button>

          {/* Client checklist */}
          {blastClients !== null && (
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b border-neutral-100">
                <span className="text-[12px] font-semibold text-neutral-600">
                  {selectedIds.size} / {blastClients.length} 人已選
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedIds(new Set(blastClients.map(c => c.id)))}
                    className="text-[11px] font-semibold px-3 py-1 bg-white border border-neutral-200 rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
                    全選
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-[11px] font-semibold px-3 py-1 bg-white border border-neutral-200 rounded-lg hover:border-red-300 hover:text-red-400 transition-all">
                    全部取消
                  </button>
                </div>
              </div>
              <div className="max-h-[280px] overflow-y-auto divide-y divide-neutral-50">
                {blastClients.length === 0 ? (
                  <p className="px-4 py-6 text-center text-[12px] text-neutral-300">No eligible clients</p>
                ) : blastClients.map(c => {
                  const checked = selectedIds.has(c.id);
                  const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.first_name;
                  return (
                    <label key={c.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${checked ? "bg-white hover:bg-neutral-50" : "bg-neutral-50"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedIds(prev => {
                          const next = new Set(prev);
                          checked ? next.delete(c.id) : next.add(c.id);
                          return next;
                        })}
                        className="w-4 h-4 accent-[#C9A84C] shrink-0"
                      />
                      <span className={`text-[13px] font-semibold flex-1 ${checked ? "text-[#1C1C1C]" : "text-neutral-300 line-through"}`}>{name}</span>
                      <span className="text-[11px] text-neutral-400 shrink-0">{c.phone}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Send / Schedule row */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <input
              type="date"
              value={blastScheduleDate}
              onChange={e => setBlastScheduleDate(e.target.value)}
              className="border border-neutral-200 rounded-lg px-2 py-1.5 text-[12px] text-neutral-700 focus:outline-none focus:border-[#C9A84C]"
            />
            <button
              onClick={scheduleBlast}
              disabled={schedulingBlast || !blastMessage.trim()}
              className="px-4 py-2 bg-purple-600 text-white text-[12px] font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-40">
              {schedulingBlast ? "Saving…" : "⏰ Schedule 10 AM"}
            </button>
            <button
              onClick={sendBlast}
              disabled={sendingBlast || !blastMessage.trim() || (blastClients !== null && selectedIds.size === 0)}
              className="px-4 py-2 bg-[#C9A84C] text-white text-[12px] font-semibold rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
              {sendingBlast ? "Sending…" : blastClients !== null ? `Send Now (${selectedIds.size})` : "Send Now"}
            </button>
          </div>

          {blastResult && (
            <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-[13px] text-green-700 font-semibold">
                Done — {blastResult.sent} sent{blastResult.failed > 0 ? `, ${blastResult.failed} failed` : ""}
              </p>
            </div>
          )}
        </div>
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

      {/* ── Cron History ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[18px] font-bold text-[#1C1C1C]">Cron History</h3>
        <button onClick={() => setShowCronLog(p => !p)} className="text-[12px] text-neutral-400 hover:text-[#1C1C1C] transition-colors">
          {showCronLog ? "Hide" : "Show"} ({cronHistory.length} runs)
        </button>
      </div>
      {showCronLog && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-8">
          {cronHistory.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-neutral-300">No cron runs logged yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {["Date","Emails Sent","SMS Sent","Unique Clients"].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-neutral-400 px-5 py-3 uppercase tracking-[0.08em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {cronHistory.map(({ date, entries }) => {
                  const emailCount  = entries.filter(e => e.action_type.includes("email")).length;
                  const smsCount    = entries.filter(e => e.action_type.includes("sms")).length;
                  const uniqueCount = new Set(entries.map(e => e.client_id)).size;
                  return (
                    <tr key={date} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 text-[13px] text-[#1C1C1C]">{normDate(date)}</td>
                      <td className="px-5 py-3 text-[13px] text-[#1C1C1C]">{emailCount}</td>
                      <td className="px-5 py-3 text-[13px] text-[#1C1C1C]">{smsCount}</td>
                      <td className="px-5 py-3 text-[13px] text-[#1C1C1C]">{uniqueCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Send History ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[18px] font-bold text-[#1C1C1C]">Send History</h3>
        <button onClick={() => setShowLog(p => !p)} className="text-[12px] text-neutral-400 hover:text-[#1C1C1C] transition-colors">
          {showLog ? "Hide" : "Show"} ({combinedHistory.length})
        </button>
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
                        e.action_type.includes("review")   ? "bg-blue-50 text-blue-600"
                        : e.action_type.includes("birthday")  ? "bg-pink-50 text-pink-500"
                        : e.action_type.includes("holiday")   ? "bg-purple-50 text-purple-600"
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
                    <td className="px-5 py-3 text-[12px] text-neutral-400">{normDate(e.sent_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete send record for ${e.name}?`)) return;
                          if (e.client_id) {
                            const res = await fetch("/api/admin/client-actions", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
                              body: JSON.stringify({ client_id: e.client_id, action_type: e.action_type }),
                            });
                            if (!res.ok) { alert("Failed to delete — please try again."); return; }
                            setHistory(prev => prev.filter(h =>
                              !(h.client_id === e.client_id && h.action_type === e.action_type)
                            ));
                          } else if (e.booking_id && e.booking_field) {
                            const res = await fetch(`/api/bookings/${e.booking_id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
                              body: JSON.stringify({ [e.booking_field]: null }),
                            });
                            if (!res.ok) { alert("Failed to delete — please try again."); return; }
                            setBookingsWithSends(prev => prev.map(b =>
                              b.id === e.booking_id ? { ...b, [e.booking_field!]: null } : b
                            ));
                          }
                        }}
                        className="text-[11px] text-neutral-300 hover:text-red-400 transition-colors px-1"
                        title="Delete record">
                        ✕
                      </button>
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

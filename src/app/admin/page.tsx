"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import CalendarView        from "./CalendarView";
import BookingsView        from "./BookingsView";
import AutomationsView     from "./AutomationsView";
import ReviewsView         from "./ReviewsView";
import DashboardView       from "./DashboardView";
import UpdateHistoryView   from "./UpdateHistoryView";
import PackagesView        from "./PackagesView";
import AnalyticsView       from "./AnalyticsView";
import SEOPagesView        from "./SEOPagesView";

// ── Types ──────────────────────────────────────────────────────
type Client = {
  id: string; visit_date: string; email: string; phone: string;
  first_name: string; last_name: string; notes: string;
  recommendation: string; elly: string; owner: string; birthday?: string;
  deleted?: boolean;
};
type Booking = {
  id: string; phone: string; email: string;
  date: string; status: string;
  refill_sent_at: string | null; review_sent_at: string | null;
};
type View = "dashboard" | "analytics" | "seo-pages" | "update-history" | "calendar" | "bookings" | "clients-main" | "clients-elly" | "automations" | "reviews" | "packages";

const EMPTY_CLIENT: Omit<Client,"id"> = {
  visit_date:"", email:"", phone:"", first_name:"", last_name:"",
  notes:"", recommendation:"", elly:"", owner:"main", birthday:"",
};
const FIELDS = ["first_name","last_name","phone","email","visit_date","birthday","notes","recommendation"] as const;

const VIEW_LABELS: Record<string, string> = {
  "dashboard":      "Dashboard",
  "analytics":      "Report",
  "calendar":       "Calendar",
  "update-history": "Update History",
  "clients-main":   "My Clients",
  "clients-elly":   "Elly's Clients",
  "automations":    "Automations",
  "reviews":        "Reviews",
  "bookings":       "Bookings",
  "packages":       "3x Package",
  "seo-pages":      "SEO Pages",
};

const BOTTOM_TABS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: "clients-main",
    label: "Clients",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "packages",
    label: "Package",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

const ICONS: Record<string, React.ReactNode> = {
  Overview: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Appointments: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Customers: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Marketing: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
};

const NAV: { section: string; items: { id: View; label: string }[] }[] = [
  { section: "Overview", items: [
    { id: "dashboard",  label: "Dashboard" },
    { id: "analytics",  label: "Report" },
    { id: "seo-pages",  label: "SEO Pages" },
  ]},
  { section: "Customers", items: [
    { id: "clients-main", label: "My Clients"    },
    { id: "clients-elly", label: "Elly's Clients" },
    { id: "packages",     label: "3x Package"    },
  ]},
  { section: "Marketing", items: [
    { id: "automations", label: "Automations" },
    { id: "reviews",     label: "Reviews"      },
  ]},
];

// ── Main ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [key,    setKey]    = useState("");
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = sessionStorage.getItem("admin_key");
    const expiry = sessionStorage.getItem("admin_expiry");
    if (saved && expiry && Date.now() < parseInt(expiry)) return true;
    return false;
  });
  const [loading,setLoading]= useState(false);
  const [view,   setView]   = useState<View>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Clients state
  const [clients,       setClients]       = useState<Client[]>([]);
  const [clientSearch,  setClientSearch]  = useState("");
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [clientDraft,   setClientDraft]   = useState<Partial<Client>>({});
  const [expandedNote,  setExpandedNote]  = useState<string | null>(null);
  const [addingClient,  setAddingClient]  = useState(false);
  const [newClient,     setNewClient]     = useState<Omit<Client,"id">>(EMPTY_CLIENT);
  const [clientSaving,  setClientSaving]  = useState(false);
  const [newDataToast,  setNewDataToast]  = useState(false);
  const [syncing,       setSyncing]       = useState(false);
  const [editModal, setEditModal] = useState<null | {
    allIds: string[];
    removedIds: string[];
    draft: {
      first_name: string; last_name: string;
      phone: string; email: string;
      recommendation: string; birthday: string;
      visits: { id: string; date: string; notes: string }[];
    };
  }>(null);
  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [openDropdown,  setOpenDropdown]  = useState<string | null>(null);
  const [showEditMenu,  setShowEditMenu]  = useState(false);
  const [deleteMode,    setDeleteMode]    = useState(false);
  const [clientTab,     setClientTab]     = useState<"active" | "deleted">("active");
  const [tracking, setTracking] = useState<Record<string, Record<string, string>>>({});

  const loadActions = useCallback(async (secret: string) => {
    try {
      const res = await fetch("/api/admin/client-actions", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) return;
      const actions: { client_id: string; action_type: string; sent_at: string }[] = await res.json();
      const map: Record<string, Record<string, string>> = {};
      for (const a of actions) {
        if (!map[a.client_id]) map[a.client_id] = {};
        map[a.client_id][a.action_type] = a.sent_at;
      }
      setTracking(map);
    } catch { /* non-fatal */ }
  }, []);

  async function trackMark(clientId: string, type: string, _name = "", date = new Date().toLocaleDateString()) {
    setTracking(prev => ({
      ...prev,
      [clientId]: { ...(prev[clientId] ?? {}), [type]: date },
    }));
    try {
      const adminKey = sessionStorage.getItem("admin_key") ?? "";
      await fetch("/api/admin/client-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ client_id: clientId, action_type: type, sent_at: date }),
      });
    } catch { /* non-fatal */ }
  }

  async function trackClear(clientId: string, type: string) {
    setTracking(prev => {
      const next = { ...prev, [clientId]: { ...(prev[clientId] ?? {}) } };
      delete next[clientId][type];
      return next;
    });
    try {
      const adminKey = sessionStorage.getItem("admin_key") ?? "";
      await fetch("/api/admin/client-actions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ client_id: clientId, action_type: type }),
      });
    } catch { /* non-fatal */ }
  }

  const normPhoneInline = (p: string) => (p ?? "").replace(/\D/g, "").slice(-10);

  async function sendReviewEmail(c: Client, ck: string) {
    if (!c.email) { alert("No email on file for this client."); return; }
    const adminKey = sessionStorage.getItem("admin_key") ?? "";
    const name = `${c.first_name} ${c.last_name}`.trim() || c.first_name;
    const res = await fetch("/api/admin/send-review", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ name, email: c.email }),
    });
    if (res.ok) {
      trackMark(ck, "review-email", name);
    } else { alert("Failed to send email. Check console."); }
  }

  async function sendReviewSMS(c: Client, ck: string) {
    if (!c.phone) { alert("No phone on file for this client."); return; }
    const adminKey = sessionStorage.getItem("admin_key") ?? "";
    const name = `${c.first_name} ${c.last_name}`.trim() || c.first_name;
    const res = await fetch("/api/admin/send-review-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ name, phone: c.phone }),
    });
    if (res.ok) {
      trackMark(ck, "review-sms", name);
    } else { alert("Failed to send SMS. Check console."); }
  }

  async function sendRefillEmail(c: Client, ck: string, serviceLabel = "your last service") {
    if (!c.email) { alert("No email on file for this client."); return; }
    const adminKey = sessionStorage.getItem("admin_key") ?? "";
    const name = `${c.first_name} ${c.last_name}`.trim() || c.first_name;
    const res = await fetch("/api/admin/send-refill", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ name, email: c.email, serviceLabel }),
    });
    if (res.ok) {
      trackMark(ck, "refill-email", name);
    } else { alert("Failed to send email. Check console."); }
  }

  async function sendRefillSMS(c: Client, ck: string) {
    if (!c.phone) { alert("No phone on file for this client."); return; }
    const adminKey = sessionStorage.getItem("admin_key") ?? "";
    const name = `${c.first_name} ${c.last_name}`.trim() || c.first_name;
    const res = await fetch("/api/admin/send-refill-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({ name, phone: c.phone }),
    });
    if (res.ok) {
      trackMark(ck, "refill-sms", name);
    } else { alert("Failed to send SMS. Check console."); }
  }

  const fetchClients = useCallback(async (secret: string) => {
    const [clientRes, bookingRes] = await Promise.all([
      fetch("/api/clients",  { headers: { Authorization: `Bearer ${secret}` } }),
      fetch("/api/bookings", { headers: { Authorization: `Bearer ${secret}` } }),
    ]);
    if (clientRes.ok) { setClients(await clientRes.json()); setAuthed(true); }
    else { alert("Wrong password"); return; }
    if (bookingRes.ok) setBookings(await bookingRes.json());
    await loadActions(secret);
  }, [loadActions]);

  useEffect(() => {
    if (!authed) return;
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    // Auto-load data on mount (handles page refresh when already authed)
    fetchClients(savedKey);
    const iv = setInterval(async () => {
      const [cRes] = await Promise.all([
        fetch("/api/clients", { headers: { Authorization: `Bearer ${savedKey}` } }),
      ]);
      if (!cRes.ok) return;
      const fresh: Client[] = await cRes.json();
      setClients(prev => { if (fresh.length > prev.length) setNewDataToast(true); return fresh; });
      await loadActions(savedKey);
    }, 60_000);
    return () => clearInterval(iv);
  }, [authed, fetchClients, loadActions]);

  useEffect(() => {
    const expiry = sessionStorage.getItem("admin_expiry");
    if (expiry && Date.now() > parseInt(expiry)) {
      sessionStorage.removeItem("admin_key");
      sessionStorage.removeItem("admin_expiry");
    }
  }, []);

  useEffect(() => {
    if (!showEditMenu) return;
    const handler = () => setShowEditMenu(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEditMenu]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: key }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Wrong password.");
      setLoading(false);
      return;
    }
    sessionStorage.setItem("admin_key", key);
    sessionStorage.setItem("admin_expiry", String(Date.now() + 8 * 60 * 60 * 1000));
    await fetchClients(key);
    setLoading(false);
  }

  async function saveNewClient() {
    setClientSaving(true);
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
      body: JSON.stringify(newClient),
    });
    if (res.ok) { const c = await res.json(); setClients(prev => [c, ...prev]); }
    setNewClient(EMPTY_CLIENT); setAddingClient(false); setClientSaving(false);
  }

  async function saveClientEdit(id: string) {
    setClientSaving(true);
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
      body: JSON.stringify(clientDraft),
    });
    if (res.ok) { const c = await res.json(); setClients(prev => prev.map(x => x.id === id ? c : x)); }
    setEditingClient(null); setClientSaving(false);
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client?")) return;
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    await fetch(`/api/clients/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${savedKey}` } });
    setClients(prev => prev.filter(c => c.id !== id));
  }

  function openEditModal(group: { client: Client; visits: { id: string; date: string; notes: string }[] }) {
    const uniqueV = Array.from(
      group.visits.reduce((map, v) => {
        const k = v.date ?? "";
        if (!map.has(k) || (v.notes && !map.get(k)!.notes)) map.set(k, v);
        return map;
      }, new Map<string, (typeof group.visits)[0]>()).values()
    ).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    setEditModal({
      allIds: group.visits.map(v => v.id),
      removedIds: [],
      draft: {
        first_name:     group.client.first_name     ?? "",
        last_name:      group.client.last_name      ?? "",
        phone:          group.client.phone          ?? "",
        email:          group.client.email          ?? "",
        recommendation: group.client.recommendation ?? "",
        birthday:       group.client.birthday       ?? "",
        visits: uniqueV.map(v => ({ id: v.id, date: v.date ?? "", notes: v.notes ?? "" })),
      },
    });
  }

  async function saveEditModal() {
    if (!editModal) return;
    setClientSaving(true);
    const { draft, removedIds } = editModal;
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    const base = {
      first_name: draft.first_name, last_name: draft.last_name,
      phone: draft.phone, email: draft.email,
      recommendation: draft.recommendation, birthday: draft.birthday,
    };
    // Update or insert each visit record
    for (const v of draft.visits) {
      if (v.id.startsWith("new_")) {
        // New visit — insert
        await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
          body: JSON.stringify({ ...base, visit_date: v.date, notes: v.notes, owner: "main" }),
        });
      } else {
        await fetch(`/api/clients/${v.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
          body: JSON.stringify({ ...base, visit_date: v.date, notes: v.notes }),
        });
      }
    }
    // Delete removed visits
    for (const id of removedIds) {
      await fetch(`/api/clients/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${savedKey}` } });
    }
    await fetchClients(savedKey);
    setEditModal(null);
    setClientSaving(false);
  }

  async function deleteClientGroup(allIds: string[], phone?: string, email?: string) {
    const normP = (p: string) => (p ?? "").replace(/\D/g, "").slice(-10);
    const bPhone = normP(phone ?? "");
    const matchedBookings = bookings.filter(b =>
      (bPhone && normP(b.phone ?? "") === bPhone) ||
      (email && b.email === email)
    );
    const bookingInfo = matchedBookings.length > 0
      ? ` and ${matchedBookings.length} booking(s)` : "";
    if (!confirm(`Delete this client (${allIds.length} visit record(s)${bookingInfo})?`)) return;
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    await Promise.all([
      ...allIds.map(id => fetch(`/api/clients/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${savedKey}` } })),
      ...matchedBookings.map(b => fetch(`/api/bookings/${b.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${savedKey}` } })),
      ...allIds.map(id => fetch("/api/admin/client-actions", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${savedKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: id }),
      })),
    ]);
    setEditModal(null);
    await fetchClients(savedKey);
  }

  async function toggleClientDeleted(allIds: string[], currentlyDeleted: boolean) {
    const savedKey = sessionStorage.getItem("admin_key") ?? "";
    const newVal = !currentlyDeleted;
    await Promise.all(allIds.map(id =>
      fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
        body: JSON.stringify({ deleted: newVal }),
      })
    ));
    setClients(prev => prev.map(c => allIds.includes(c.id) ? { ...c, deleted: newVal } : c));
  }

  function exportCSV(tab: "main" | "elly") {
    const list = clients.filter(c => tab === "elly" ? c.owner === "elly" : c.owner !== "elly");

    // Group by phone/email, then sort by most recent visit descending (same as table)
    const groups = Object.values(
      list.reduce((acc, c) => {
        const np = normPhone(c.phone);
        const k = np || c.email || c.id;
        if (!acc[k]) {
          acc[k] = { client: { ...c }, visits: [] as { date: string; notes: string }[] };
        } else {
          if (!acc[k].client.email && c.email) acc[k].client.email = c.email;
          if (!acc[k].client.last_name && c.last_name) acc[k].client.last_name = c.last_name;
          if (!acc[k].client.first_name && c.first_name) acc[k].client.first_name = c.first_name;
          if (c.phone && !acc[k].client.phone) acc[k].client.phone = c.phone;
          if (c.birthday && !acc[k].client.birthday) acc[k].client.birthday = c.birthday;
        }
        acc[k].visits.push({ date: c.visit_date, notes: c.notes });
        return acc;
      }, {} as Record<string, { client: Client; visits: { date: string; notes: string }[] }>)
    ).sort((a, b) => {
      const latestA = a.visits.map(v => v.date ?? "").sort().at(-1) ?? "";
      const latestB = b.visits.map(v => v.date ?? "").sort().at(-1) ?? "";
      return latestB.localeCompare(latestA);
    });

    const isAutoNote = (n: string) => !n || n === "Square booking"
      || /^Square appt \d{4}-\d{2}-\d{2}/.test(n)
      || /^Client:/i.test(n)
      || /new customer/i.test(n)
      || /groupon/i.test(n)
      || /came in/i.test(n)
      || /removal.*discount/i.test(n)
      || /^\/\/ Merged on/i.test(n)
      || /Following fields were not transferred/i.test(n);

    const fmtPhone = (p: string) => {
      const d = (p ?? "").replace(/\D/g, "");
      const n = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
      if (n.length === 10) return `(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`;
      return p ?? "";
    };

    const esc = (v: string) => (v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

    const HEADERS = ["Visit History","First Name","Last Name","Phone","Email","Notes","Referred By"];

    const dataRows = groups.map(({ client: c, visits }) => {
      const uniqueVisits = Array.from(
        visits.reduce((map, v) => {
          const k = v.date ?? "";
          if (!map.has(k) || (v.notes && !map.get(k)!.notes)) map.set(k, v);
          return map;
        }, new Map<string, { date: string; notes: string }>()).values()
      ).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")); // newest → oldest

      const dates = uniqueVisits.map(v => v.date).filter(Boolean).join(", ");
      const notes = uniqueVisits.filter(v => !isAutoNote(v.notes)).map(v => v.notes).join(" | ");

      const firstName = c.first_name || (!c.last_name ? "Unknown" : "");
      return [dates, firstName, c.last_name, fmtPhone(c.phone), c.email, notes, c.recommendation];
    });

    // Excel XML Spreadsheet 2003 — supports center alignment natively
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="h">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1C1C1C" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="c">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Clients">
    <Table>
      <Row>
        ${HEADERS.map(h => `<Cell ss:StyleID="h"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}
      </Row>
      ${dataRows.map(row => `<Row>${row.map(v => `<Cell ss:StyleID="c"><Data ss:Type="String">${esc(v ?? "")}</Data></Cell>`).join("")}</Row>`).join("\n      ")}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `clients-${tab}-${new Date().toISOString().split("T")[0]}.xls`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── Login ──────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-[2rem] font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700 }}>Admin</h1>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input type="password" value={key} onChange={e => setKey(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-white border border-neutral-200 px-4 py-3.5 text-[13px] text-[#1C1C1C] rounded-xl focus:outline-none focus:border-[#C9A84C] transition-colors" />
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-[0.25em] rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const savedKey   = sessionStorage.getItem("admin_key") ?? "";
  const activeTab  = view === "clients-elly" ? "elly" : "main";
  const tabClients = clients.filter(c => activeTab === "elly" ? c.owner === "elly" : c.owner !== "elly");

  const normPhone = (p: string) => p ? p.replace(/\D/g, "").slice(-10) : "";
  const fmtPhone = (p: string) => {
    const d = p?.replace(/\D/g, "") ?? "";
    if (d.length === 10) return `+1${d}`;
    if (d.length === 11 && d.startsWith("1")) return `+${d}`;
    return p;
  };

  type ClientGroup = { client: Client; visits: { date: string; notes: string; id: string }[]; isDeleted: boolean };

  function buildClientGroups(list: Client[]): ClientGroup[] {
    return Object.values(
      list.reduce((acc, c) => {
        const np = normPhone(c.phone);
        const k = np || c.email || c.id;
        if (!acc[k]) acc[k] = { client: { ...c }, visits: [], isDeleted: !!c.deleted };
        else {
          if (!acc[k].client.email && c.email) acc[k].client.email = c.email;
          if (!acc[k].client.last_name && c.last_name) acc[k].client.last_name = c.last_name;
          if (!acc[k].client.first_name && c.first_name) acc[k].client.first_name = c.first_name;
          if (c.phone && !acc[k].client.phone) acc[k].client.phone = c.phone;
          if (c.birthday && !acc[k].client.birthday) acc[k].client.birthday = c.birthday;
          if (c.deleted) acc[k].isDeleted = true;
        }
        acc[k].visits.push({ date: c.visit_date, notes: c.notes, id: c.id });
        return acc;
      }, {} as Record<string, ClientGroup>)
    ).sort((a, b) => {
      if (activeTab === "elly") {
        return (a.client.first_name ?? "").localeCompare(b.client.first_name ?? "") ||
               (a.client.last_name  ?? "").localeCompare(b.client.last_name  ?? "");
      }
      const latestA = a.visits.map(v => v.date ?? "").sort().at(-1) ?? "";
      const latestB = b.visits.map(v => v.date ?? "").sort().at(-1) ?? "";
      return latestB.localeCompare(latestA);
    });
  }

  // All groups (no search) for counts
  const allGroups = buildClientGroups(tabClients);
  const deletedGroupCount = allGroups.filter(g => g.isDeleted).length;
  const activeGroupsList  = allGroups.filter(g => !g.isDeleted);

  // Counts (exclude deleted)
  const allUniqueClients = activeGroupsList.map(g => ({ hasEmail: !!g.client.email }));
  const onlineCount      = allUniqueClients.filter(c => c.hasEmail).length;
  const totalUniqueCount = allUniqueClients.length;

  // Search + tab filter
  const filteredClients = tabClients.filter(c =>
    !clientSearch || [c.first_name,c.last_name,c.email,c.phone,c.notes,c.recommendation]
      .some(v => v?.toLowerCase().includes(clientSearch.toLowerCase()))
  );
  const clientGroups = buildClientGroups(filteredClients).filter(g =>
    clientTab === "deleted" ? g.isDeleted : !g.isDeleted
  );

  function Sidebar() {
    return (
      <aside className="w-64 shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white text-[13px] font-bold shrink-0">Y</div>
            <div>
              <p className="text-[14px] font-bold text-[#1C1C1C] leading-tight">Yee Eyelashes</p>
              <p className="text-[11px] text-neutral-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(section => {
            const isCollapsed = collapsed.has(section.section);
            const hasActive   = section.items.some(i => i.id === view);
            const toggle = () => setCollapsed(prev => {
              const next = new Set(prev);
              next.has(section.section) ? next.delete(section.section) : next.add(section.section);
              return next;
            });
            return (
              <div key={section.section}>
                <button onClick={toggle}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group
                    ${hasActive && isCollapsed ? "bg-neutral-100" : "hover:bg-neutral-50"}`}>
                  <span className={`shrink-0 transition-colors ${hasActive ? "text-[#1C1C1C]" : "text-neutral-400 group-hover:text-neutral-600"}`}>
                    {ICONS[section.section]}
                  </span>
                  <span className={`flex-1 text-[14px] font-bold leading-tight transition-colors
                    ${hasActive ? "text-[#1C1C1C]" : "text-neutral-500 group-hover:text-[#1C1C1C]"}`}>
                    {section.section}
                  </span>
                  <span className="text-neutral-300 text-[13px] shrink-0 group-hover:text-neutral-400">
                    {isCollapsed ? "›" : "⌄"}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="ml-9 mt-0.5 mb-1 space-y-0.5">
                    {section.items.map(item => (
                      <button key={item.id}
                        onClick={() => { setView(item.id); setSideOpen(false); setClientSearch(""); setAddingClient(false); }}
                        className={`w-full text-left px-3 py-2 text-[13px] font-semibold rounded-lg transition-all
                          ${view === item.id
                            ? "bg-[#1C1C1C] text-white"
                            : "text-neutral-500 hover:bg-neutral-100 hover:text-[#1C1C1C]"}`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-300">{clientGroups.length} clients · {new Date().toLocaleDateString()}</p>
        </div>
      </aside>
    );
  }

  function ClientsView() {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1C1C1C]">
              {view === "clients-elly" ? "Elly's Clients" : "My Clients"}
            </h2>
            <p className="text-[11px] text-neutral-400">
              {totalUniqueCount} active
              {deletedGroupCount > 0 && <span className="ml-1.5 text-red-300">· {deletedGroupCount} deleted</span>}
            </p>
          </div>
          {view !== "clients-elly" && (
            <p className="text-[11px] text-neutral-400 mt-1">
              <span className="font-semibold text-[#1C1C1C]">{onlineCount}</span>
              <span className="text-neutral-300"> / {totalUniqueCount}</span>
              <span className="ml-1">online bookings</span>
            </p>
          )}
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {/* Active / Deleted tabs */}
          <div className="bg-white px-6 border-b border-neutral-100 flex gap-0">
            <button
              onClick={() => setClientTab("active")}
              className={`px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors ${clientTab === "active" ? "border-[#C9A84C] text-[#1C1C1C]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
              Active ({totalUniqueCount})
            </button>
            <button
              onClick={() => setClientTab("deleted")}
              className={`px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors ${clientTab === "deleted" ? "border-red-400 text-red-500" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
              Deleted {deletedGroupCount > 0 && `(${deletedGroupCount})`}
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-white px-6 py-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <input type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full sm:w-64 bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={async () => {
                setSyncing(true);
                try {
                  const res = await fetch("/api/admin/sync-square-bookings", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${savedKey}` },
                  });
                  const data = await res.json();
                  const updates: { name: string; date: string; note: string }[] = data.noteUpdates ?? [];
                  let msg = `Synced ${data.synced ?? 0} bookings · ${data.clientsSynced ?? 0} new clients · ${updates.length} notes updated`;
                  if (updates.length > 0) {
                    msg += "\n\nUpdated notes:";
                    for (const u of updates) {
                      msg += `\n• ${u.name} (${u.date}): ${u.note}`;
                    }
                  }
                  alert(msg);
                  await fetchClients(savedKey);
                } finally {
                  setSyncing(false);
                }
              }} disabled={syncing} className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-200 transition-all whitespace-nowrap disabled:opacity-50">
                {syncing ? "Syncing…" : "↻ Sync Square"}
              </button>
              <button onClick={() => exportCSV(activeTab)}
                className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#1C1C1C] text-white rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
                Export
              </button>
              <button
                onClick={() => { setNewClient({ ...EMPTY_CLIENT, owner: activeTab === "elly" ? "elly" : "main" }); setAddingClient(p => !p); setDeleteMode(false); }}
                className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#C9A84C] text-white rounded-xl hover:opacity-80 transition-all whitespace-nowrap">
                + New Client
              </button>
              <button
                onClick={() => setDeleteMode(v => !v)}
                className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] rounded-xl border transition-all whitespace-nowrap ${deleteMode ? "bg-red-50 text-red-500 border-red-200 font-bold" : "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
                {deleteMode ? "✓ Del Mode" : "Del Mode"}
              </button>
            </div>
          </div>

          {/* Add form */}
          {addingClient && (
            <div className="bg-white border-b border-neutral-100 px-6 py-5">
              <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] mb-4">New Client</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {FIELDS.map(f => (
                  <div key={f} className={f === "notes" || f === "recommendation" ? "sm:col-span-2" : ""}>
                    <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">{f.replace(/_/g," ")}</label>
                    <input type={f === "visit_date" ? "date" : "text"} value={newClient[f]}
                      onChange={e => setNewClient(prev => ({ ...prev, [f]: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={saveNewClient} disabled={clientSaving}
                  className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#C9A84C] text-white rounded-xl hover:opacity-80 disabled:opacity-40 transition-all">
                  {clientSaving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setAddingClient(false); setNewClient(EMPTY_CLIENT); }}
                  className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-neutral-100 text-neutral-500 rounded-xl hover:bg-neutral-200 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Mobile cards */}
          <div className="block sm:hidden bg-white divide-y divide-neutral-100">
            {clientGroups.length === 0 && (
              <p className="py-16 text-center text-[13px] text-neutral-300">No clients found</p>
            )}
            {clientGroups.map(({ client: c, visits, isDeleted }, idx) => {
              // Deduplicate visits by date (same as desktop)
              const uniqueV = Array.from(
                visits.reduce((map, v) => {
                  const k = v.date ?? "";
                  if (!map.has(k) || (v.notes && !map.get(k)!.notes)) map.set(k, v);
                  return map;
                }, new Map<string, typeof visits[0]>()).values()
              ).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

              const ck = c.id;
              const reviewGiven    = tracking[ck]?.["review-given"];
              const reviewSentAt   = tracking[ck]?.["review-email"];
              const refillSentAt   = tracking[ck]?.["refill-email"];
              const cPhoneN        = normPhoneInline(c.phone ?? "");
              const clientBkgs     = bookings.filter(b =>
                (cPhoneN && normPhoneInline(b.phone ?? "") === cPhoneN) ||
                (c.email && b.email === c.email)
              );
              const dbReview = clientBkgs.map(b => b.review_sent_at).filter(Boolean).sort().at(-1);
              const dbRefill = clientBkgs.map(b => b.refill_sent_at).filter(Boolean).sort().at(-1);
              const reviewAlreadySent = !!dbReview || !!reviewSentAt;
              const refillAlreadySent  = !!dbRefill  || !!refillSentAt;
              const reviewSmsSentAt = tracking[ck]?.["review-sms"];
              const refillSmsSentAt = tracking[ck]?.["refill-sms"];
              const clientName = `${c.first_name} ${c.last_name}`.trim() || "Unknown";

              return (
                <div key={c.id} className={`px-4 py-4 ${isDeleted ? "opacity-50" : ""}`}>
                  {editingClient === c.id ? (
                    <div className="space-y-3">
                      {FIELDS.map(f => (
                        <div key={f}>
                          <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">{f.replace(/_/g," ")}</label>
                          <input type={f === "visit_date" ? "date" : "text"}
                            value={(clientDraft[f] ?? c[f]) as string}
                            onChange={e => setClientDraft(prev => ({ ...prev, [f]: e.target.value }))}
                            className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveClientEdit(c.id)} disabled={clientSaving}
                          className="flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#C9A84C] text-white rounded-xl disabled:opacity-40">
                          {clientSaving ? "…" : "Save"}
                        </button>
                        <button onClick={() => setEditingClient(null)}
                          className="flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-neutral-100 text-neutral-400 rounded-xl">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Row 1: name + edit/del */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[15px] font-semibold text-[#1C1C1C]">
                            <span className="text-[11px] text-neutral-300 tabular-nums mr-1.5">{idx+1}</span>
                            {clientName}
                          </p>
                          {uniqueV.length > 1 && (
                            <span className="inline-block mt-1 text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
                              {uniqueV.length}x visit
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                          <button onClick={() => toggleClientDeleted(visits.map(v => v.id), isDeleted)}
                            className={`text-[9px] px-3 py-1.5 border rounded-lg transition-colors ${isDeleted ? "bg-red-50 text-red-400 border-red-200" : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-red-200 hover:text-red-400"}`}>
                            {isDeleted ? "✓ Deleted" : "Deleted?"}
                          </button>
                          <button onClick={() => openEditModal({ client: c, visits: uniqueV })}
                            className="text-[9px] px-3 py-1.5 bg-blue-50 text-blue-400 border border-blue-200 rounded-lg">✏ Edit</button>
                          <button onClick={() => deleteClientGroup(visits.map(v => v.id), c.phone, c.email)}
                            className="text-[9px] px-3 py-1.5 bg-red-50 text-red-400 border border-red-200 rounded-lg">Del</button>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="space-y-1 mb-3 text-[12px]">
                        {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-[#C9A84C]"><span className="text-neutral-300">📞</span>{fmtPhone(c.phone)}</a>}
                        {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-neutral-500 truncate"><span className="text-neutral-300">✉</span>{c.email}</a>}
                        {c.recommendation && <p className="text-neutral-400 pl-1">→ {c.recommendation}</p>}
                      </div>

                      {/* Visit history (deduped) */}
                      {uniqueV.length > 0 && (() => {
                        const mCancelledDates = new Set(
                          bookings.filter(b => b.status === "cancelled" && (
                            (c.phone && normPhoneInline(b.phone ?? "") === cPhoneN) ||
                            (c.email && b.email === c.email)
                          )).map(b => b.date)
                        );
                        return (
                          <div className="bg-neutral-50 rounded-xl px-3 py-2.5 mb-3 space-y-1.5">
                            {uniqueV.map(v => (
                              <div key={v.id} className="flex items-start gap-2">
                                <div className="flex flex-col leading-tight shrink-0">
                                  <span className={`text-[11px] whitespace-nowrap ${mCancelledDates.has(v.date ?? "") ? "line-through text-neutral-300" : "text-neutral-400"}`}>{v.date}</span>
                                  {mCancelledDates.has(v.date ?? "") && (
                                    <span className="text-[9px] uppercase tracking-[0.1em] text-red-400">cancelled</span>
                                  )}
                                </div>
                                {v.notes && !/^Square (booking|appt \d{4}-\d{2}-\d{2})/i.test(v.notes) && !/^Client:/i.test(v.notes) && !/new customer/i.test(v.notes) && !/groupon/i.test(v.notes) && !/came in/i.test(v.notes) && (
                                  <button onClick={() => setExpandedNote(expandedNote === v.id ? null : v.id)}
                                    className="text-[11px] text-[#C9A84C] text-left flex-1">
                                    <span className={expandedNote === v.id ? "whitespace-pre-wrap" : "line-clamp-2"}>{v.notes}</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Actions: ★ Given + 2×2 send grid */}
                      <div className="space-y-2">
                        <button
                          onClick={() => reviewGiven ? trackClear(ck, "review-given") : trackMark(ck, "review-given")}
                          className={`w-full py-2 px-1 text-[10px] font-semibold rounded-xl border transition-all ${
                            reviewGiven
                              ? "bg-green-50 border-green-300 text-green-700"
                              : "bg-neutral-50 border-neutral-200 text-neutral-400"
                          }`}>
                          {reviewGiven ? `✓ ${reviewGiven}` : "★ Review Given"}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => sendReviewEmail(c, ck)}
                            disabled={!c.email || reviewAlreadySent || isDeleted}
                            className={`py-2 px-1 text-[10px] font-semibold rounded-xl border transition-all disabled:opacity-30 ${
                              reviewSentAt
                                ? "bg-green-50 border-green-300 text-green-700"
                                : dbReview
                                  ? "bg-neutral-100 border-neutral-200 text-neutral-400"
                                  : "bg-neutral-50 border-neutral-200 text-neutral-500 active:bg-neutral-100"
                            }`}>
                            {reviewSentAt ? `✓ ${reviewSentAt}` : dbReview ? <span>✉ Review<br/><span className="text-[9px] text-neutral-400">Auto ✓</span></span> : "✉ Review Email"}
                          </button>
                          <button
                            onClick={() => sendReviewSMS(c, ck)}
                            disabled={!c.phone || !!reviewSmsSentAt || isDeleted}
                            className={`py-2 px-1 text-[10px] font-semibold rounded-xl border transition-all disabled:opacity-30 ${
                              reviewSmsSentAt
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-neutral-50 border-neutral-200 text-neutral-500 active:bg-neutral-100"
                            }`}>
                            {reviewSmsSentAt ? `✓ ${reviewSmsSentAt}` : "💬 Review SMS"}
                          </button>
                          <button
                            onClick={() => sendRefillEmail(c, ck)}
                            disabled={!c.email || refillAlreadySent || isDeleted}
                            className={`py-2 px-1 text-[10px] font-semibold rounded-xl border transition-all disabled:opacity-30 ${
                              refillSentAt
                                ? "bg-green-50 border-green-300 text-green-700"
                                : dbRefill
                                  ? "bg-neutral-100 border-neutral-200 text-neutral-400"
                                  : "bg-neutral-50 border-neutral-200 text-neutral-500 active:bg-neutral-100"
                            }`}>
                            {refillSentAt ? `✓ ${refillSentAt}` : dbRefill ? <span>✉ Refill<br/><span className="text-[9px] text-neutral-400">Auto ✓</span></span> : "✉ Refill Email"}
                          </button>
                          <button
                            onClick={() => sendRefillSMS(c, ck)}
                            disabled={!c.phone || !!refillSmsSentAt || isDeleted}
                            className={`py-2 px-1 text-[10px] font-semibold rounded-xl border transition-all disabled:opacity-30 ${
                              refillSmsSentAt
                                ? "bg-amber-50 border-amber-200 text-amber-600"
                                : "bg-neutral-50 border-neutral-200 text-neutral-500 active:bg-neutral-100"
                            }`}>
                            {refillSmsSentAt ? `✓ ${refillSmsSentAt}` : "💬 Refill SMS"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Edit Client Modal ──────────────────────────────────── */}
          {editModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setEditModal(null)}>
              <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                  <p className="text-[16px] font-bold text-[#1C1C1C]">Edit Client</p>
                  <button onClick={() => setEditModal(null)} className="text-neutral-300 hover:text-neutral-600 text-xl leading-none">✕</button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    {(["first_name","last_name"] as const).map(f => (
                      <div key={f}>
                        <label className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-1">{f === "first_name" ? "First Name" : "Last Name"}</label>
                        <input value={editModal.draft[f]}
                          onChange={e => setEditModal(p => p ? { ...p, draft: { ...p.draft, [f]: e.target.value } } : null)}
                          className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                      </div>
                    ))}
                  </div>

                  {/* Phone + Email */}
                  {(["phone","email"] as const).map(f => (
                    <div key={f}>
                      <label className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-1">{f === "phone" ? "Phone" : "Email"}</label>
                      <input value={editModal.draft[f]} type={f === "email" ? "email" : "tel"}
                        onChange={e => setEditModal(p => p ? { ...p, draft: { ...p.draft, [f]: e.target.value } } : null)}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                  ))}

                  {/* Referred By + Birthday */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-1">Referred By</label>
                      <input value={editModal.draft.recommendation}
                        onChange={e => setEditModal(p => p ? { ...p, draft: { ...p.draft, recommendation: e.target.value } } : null)}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-1">Birthday</label>
                      <input value={editModal.draft.birthday} placeholder="MM/DD"
                        onChange={e => setEditModal(p => p ? { ...p, draft: { ...p.draft, birthday: e.target.value } } : null)}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#C9A84C]" />
                    </div>
                  </div>

                  {/* Visit dates */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Visit Dates & Notes</label>
                    <div className="space-y-2">
                      {editModal.draft.visits.map((v, i) => (
                        <div key={v.id} className="bg-neutral-50 rounded-xl p-3 flex items-start gap-2">
                          <div className="flex-1 space-y-1.5">
                            <input type="date" value={v.date}
                              onChange={e => setEditModal(p => {
                                if (!p) return null;
                                const visits = [...p.draft.visits];
                                visits[i] = { ...visits[i], date: e.target.value };
                                return { ...p, draft: { ...p.draft, visits } };
                              })}
                              className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 text-[13px] bg-white focus:outline-none focus:border-[#C9A84C]" />
                            <input value={v.notes} placeholder="Notes (optional)"
                              onChange={e => setEditModal(p => {
                                if (!p) return null;
                                const visits = [...p.draft.visits];
                                visits[i] = { ...visits[i], notes: e.target.value };
                                return { ...p, draft: { ...p.draft, visits } };
                              })}
                              className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 text-[13px] bg-white focus:outline-none focus:border-[#C9A84C]" />
                          </div>
                          <button
                            onClick={() => setEditModal(p => {
                              if (!p) return null;
                              return {
                                ...p,
                                removedIds: [...p.removedIds, v.id],
                                draft: { ...p.draft, visits: p.draft.visits.filter((_, j) => j !== i) },
                              };
                            })}
                            className="text-neutral-300 hover:text-red-400 text-[18px] leading-none mt-1 transition-colors">✕</button>
                        </div>
                      ))}
                      {editModal.draft.visits.length === 0 && (
                        <p className="text-[12px] text-neutral-300 text-center py-3">All visits removed</p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditModal(p => p ? {
                        ...p,
                        draft: {
                          ...p.draft,
                          visits: [{ id: `new_${Date.now()}`, date: new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }), notes: "" }, ...p.draft.visits],
                        },
                      } : null)}
                      className="mt-2 w-full py-2 text-[11px] uppercase tracking-[0.15em] text-[#C9A84C] border border-dashed border-[#C9A84C]/40 rounded-xl hover:bg-[#C9A84C]/5 transition-colors">
                      + Add Date
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-neutral-100 flex gap-2">
                  <button
                    onClick={() => deleteClientGroup(editModal.allIds, editModal.draft.phone, editModal.draft.email)}
                    className="px-4 py-2.5 text-[11px] font-bold bg-red-50 text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                    Delete All
                  </button>
                  <button onClick={() => setEditModal(null)}
                    className="flex-1 py-2.5 text-[12px] font-bold bg-neutral-100 text-neutral-500 rounded-xl">
                    Cancel
                  </button>
                  <button onClick={saveEditModal} disabled={clientSaving}
                    className="flex-1 py-2.5 text-[12px] font-bold bg-[#1C1C1C] text-white rounded-xl hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-40">
                    {clientSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden sm:block bg-white">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#e5e7eb]">
                <tr>
                  {["#","Edit","Visit History","First Name","Last Name","Phone","Email","Notes","Referred By","Review","Actions"].map(h => (
                    <th key={h} className="px-4 py-4 text-[9px] uppercase tracking-[0.35em] text-[#1C1C1C] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientGroups.length === 0 && (
                  <tr><td colSpan={12} className="px-5 py-16 text-center text-[13px] text-neutral-300">No clients found</td></tr>
                )}
                {clientGroups.map(({ client: c, visits, isDeleted }, idx) => (
                  <tr key={c.id} className={`border-b border-neutral-50 hover:bg-[#FAFAF8] transition-colors ${isDeleted ? "opacity-50" : ""}`}>
                      <>
                        <td className="px-3 py-3 text-[11px] text-neutral-300 tabular-nums text-center w-8">{idx + 1}</td>
                        <td className="px-3 py-3">
                          {deleteMode
                            ? <button onClick={() => deleteClient(c.id)}
                                className="text-[10px] px-2 py-1.5 bg-red-50 text-red-400 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-bold">✕</button>
                            : <button onClick={() => openEditModal({ client: c, visits })}
                                className="text-[10px] px-2.5 py-1.5 bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-lg hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C] transition-all font-semibold whitespace-nowrap">
                                ✏ Edit
                              </button>}
                        </td>
                        {(() => {
                          // Deduplicate visits by date (keep the one with notes if available)
                          const uniqueVisits = Array.from(
                            visits.reduce((map, v) => {
                              const key = v.date ?? "";
                              if (!map.has(key) || (v.notes && !map.get(key)!.notes)) map.set(key, v);
                              return map;
                            }, new Map<string, typeof visits[0]>()).values()
                          ).sort((a,b) => (b.date ?? "").localeCompare(a.date ?? ""));

                          const ck = c.id;
                          const isAutoNote = (n: string) => !n || n === "Square booking" || /^Square appt \d{4}-\d{2}-\d{2}/.test(n) || /^Client:/i.test(n) || /new customer/i.test(n) || /groupon/i.test(n) || /came in/i.test(n) || /^\/\/ Merged on/i.test(n) || /Following fields were not transferred/i.test(n);
                          const allNotes = uniqueVisits.filter(v => v.notes && !isAutoNote(v.notes)).map(v => v.notes);
                          const notesKey = `notes-${c.id}`;

                          const normP2 = (p: string) => (p ?? "").replace(/\D/g,"").slice(-10);
                          const cancelledDates = new Set(
                            bookings.filter(b => b.status === "cancelled" && (
                              (c.phone && normP2(b.phone) === normP2(c.phone)) ||
                              (c.email && b.email === c.email)
                            )).map(b => b.date)
                          );

                          return (
                            <>
                              {/* Visit History */}
                              <td className="px-4 py-3 min-w-[110px]">
                                <div className="flex flex-col gap-0.5">
                                  {uniqueVisits.map(v => (
                                    <div key={v.id} className="flex flex-col leading-tight">
                                      <span className={`text-[12px] whitespace-nowrap ${cancelledDates.has(v.date ?? "") ? "line-through text-neutral-300" : "text-[#1C1C1C]"}`}>{v.date}</span>
                                      {cancelledDates.has(v.date ?? "") && (
                                        <span className="text-[9px] uppercase tracking-[0.15em] text-red-400">cancelled</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {uniqueVisits.length > 1 && (
                                  <span className="inline-block mt-1 text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
                                    {uniqueVisits.length}x visit
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#1C1C1C]">
                                {c.first_name || (!c.last_name ? <span className="text-neutral-300">Unknown</span> : "")}
                              </td>
                              <td className="px-4 py-3 text-[13px] text-[#1C1C1C]">{c.last_name}</td>
                              <td className="px-4 py-3"><a href={`tel:${c.phone}`} className="text-[12px] text-[#1C1C1C] hover:underline">{fmtPhone(c.phone)}</a></td>
                              <td className="px-4 py-3"><a href={`mailto:${c.email}`} className="text-[12px] text-[#1C1C1C] hover:underline truncate block max-w-[160px]">{c.email}</a></td>

                              {/* Notes — show all */}
                              <td className="px-4 py-3 min-w-[140px] max-w-[220px]">
                                {allNotes.length === 0 ? (
                                  <span className="text-[11px] text-neutral-200">—</span>
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    {uniqueVisits.filter(v => v.notes && !isAutoNote(v.notes)).map(v => (
                                      <p key={v.id} className="text-[11px] text-[#1C1C1C] leading-snug">{v.notes}</p>
                                    ))}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-3 max-w-[140px]"><p className="text-[11px] text-[#1C1C1C] truncate">{c.recommendation}</p></td>

                              {/* Review given in-person column */}
                              {(() => {
                                const reviewGivenKey = "review-given";
                                const reviewGiven = tracking[ck]?.[reviewGivenKey];
                                return (
                                  <td className="px-3 py-3 text-center">
                                    <button
                                      type="button"
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => reviewGiven ? trackClear(ck, reviewGivenKey) : trackMark(ck, reviewGivenKey)}
                                      title={reviewGiven ? `Given on ${reviewGiven}` : "Mark as reviewed in person"}
                                      className={`text-[11px] px-2 py-1.5 rounded-lg border transition-all ${
                                        reviewGiven
                                          ? "bg-green-50 border-green-300 text-green-700 font-semibold"
                                          : "bg-neutral-50 border-neutral-200 text-neutral-300 hover:border-[#C9A84C] hover:text-[#C9A84C]"
                                      }`}>
                                      {reviewGiven ? `✓ ${reviewGiven}` : "—"}
                                    </button>
                                  </td>
                                );
                              })()}

                              {/* Actions dropdown — Email only for Review / Refill + Edit / Del */}
                              {(() => {
                                const dropId = `${ck}-actions`;
                                const cPhone = normPhoneInline(c.phone ?? "");
                                const clientBookings = bookings.filter(b =>
                                  (cPhone && normPhoneInline(b.phone ?? "") === cPhone) ||
                                  (c.email && b.email === c.email)
                                );
                                const dbReviewSent = clientBookings.map(b => b.review_sent_at).filter(Boolean).sort().at(-1);
                                const dbRefillSent = clientBookings.map(b => b.refill_sent_at).filter(Boolean).sort().at(-1);

                                const fmtSent = (iso: string) =>
                                  new Date(iso).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });

                                const name = `${c.first_name} ${c.last_name}`.trim() || c.first_name;

                                const reviewAlreadySent  = !!dbReviewSent || !!tracking[ck]?.["review-email"];
                                const refillAlreadySent  = !!dbRefillSent  || !!tracking[ck]?.["refill-email"];
                                const reviewSmsAlreadySent = !!tracking[ck]?.["review-sms"];
                                const refillSmsAlreadySent = !!tracking[ck]?.["refill-sms"];
                                const groups = [
                                  {
                                    label: "Review",
                                    items: [
                                      { key: "review-email" as const, icon: "✉", label: "Email", canSend: !!c.email && !reviewAlreadySent && !isDeleted, onSend: () => sendReviewEmail(c, ck), autoSent: dbReviewSent ? fmtSent(dbReviewSent) : undefined },
                                      { key: "review-sms"   as const, icon: "💬", label: "SMS",   canSend: !!c.phone && !reviewSmsAlreadySent && !isDeleted, onSend: () => sendReviewSMS(c, ck),   autoSent: undefined },
                                    ],
                                  },
                                  {
                                    label: "Refill",
                                    items: [
                                      { key: "refill-email" as const, icon: "✉", label: "Email", canSend: !!c.email && !refillAlreadySent && !isDeleted, onSend: () => sendRefillEmail(c, ck), autoSent: dbRefillSent ? fmtSent(dbRefillSent) : undefined },
                                      { key: "refill-sms"   as const, icon: "💬", label: "SMS",   canSend: !!c.phone && !refillSmsAlreadySent && !isDeleted, onSend: () => sendRefillSMS(c, ck),   autoSent: undefined },
                                    ],
                                  },
                                ];
                                const doneCount =
                                  (!!tracking[ck]?.["review-email"] || !!dbReviewSent ? 1 : 0) +
                                  (!!tracking[ck]?.["review-sms"]                     ? 1 : 0) +
                                  (!!tracking[ck]?.["refill-email"] || !!dbRefillSent ? 1 : 0) +
                                  (!!tracking[ck]?.["refill-sms"]                     ? 1 : 0);

                                return (
                                  <td className="px-3 py-3 text-center relative">
                                    <button
                                      type="button"
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => setOpenDropdown(openDropdown === dropId ? null : dropId)}
                                      className={`text-[12px] font-semibold px-3 py-2 border-2 rounded-xl transition-all whitespace-nowrap
                                        ${doneCount === 4
                                          ? "border-green-400 text-green-700 bg-green-50"
                                          : doneCount > 0
                                            ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5 hover:bg-[#C9A84C]/10"
                                            : "border-[#1C1C1C] text-[#1C1C1C] bg-white hover:bg-[#1C1C1C] hover:text-white"
                                        }`}>
                                      {doneCount > 0 ? `✓ ${doneCount}/4 ▾` : "Actions ▾"}
                                    </button>

                                    {openDropdown === dropId && (
                                      <div className="absolute z-30 right-0 top-full mt-1 bg-white border border-neutral-200 shadow-xl rounded-2xl w-[240px] text-left overflow-hidden">
                                        {isDeleted && (
                                          <div className="px-4 py-3 text-[11px] text-neutral-400">Actions disabled for deleted clients.</div>
                                        )}
                                        {!isDeleted && groups.map((group, gi) => (
                                          <div key={group.label} className={gi > 0 ? "border-t-2 border-neutral-100" : ""}>
                                            <div className="px-4 pt-3 pb-1">
                                              <span className="text-[13px] font-bold text-[#1C1C1C]">{group.label}</span>
                                            </div>
                                            {group.items.map(item => {
                                              const manualSent = tracking[ck]?.[item.key];
                                              const isAuto     = !manualSent && !!item.autoSent;
                                              return (
                                                <div key={item.key} className={`mx-3 mb-2 px-3 py-2 rounded-lg ${manualSent ? "bg-green-50" : isAuto ? "bg-neutral-100" : "bg-neutral-50"}`}>
                                                  <div className="flex items-center justify-between">
                                                    <span className={`text-[12px] font-semibold ${manualSent ? "text-green-700" : isAuto ? "text-neutral-400" : "text-neutral-700"}`}>
                                                      {item.icon} {item.label}
                                                    </span>
                                                    {manualSent ? (
                                                      <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-green-600 font-medium">✓ {manualSent}</span>
                                                        <button onClick={() => { setOpenDropdown(null); trackClear(ck, item.key); }}
                                                          className="text-[10px] text-red-300 hover:text-red-500">✕</button>
                                                      </div>
                                                    ) : isAuto ? (
                                                      <span className="text-[10px] text-neutral-400 font-medium">Auto ✓ {item.autoSent}</span>
                                                    ) : (
                                                      <button
                                                        onClick={async () => { await item.onSend(); }}
                                                        disabled={!item.canSend}
                                                        className="text-[11px] font-medium px-3 py-1 bg-[#1C1C1C] text-white rounded-lg hover:bg-[#C9A84C] disabled:opacity-30 transition-all">
                                                        Send
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ))}
                                        <div className="border-t-2 border-neutral-100 px-3 py-2 flex gap-2">
                                          <button onClick={() => { setOpenDropdown(null); toggleClientDeleted(visits.map(v => v.id), isDeleted); }}
                                            className={`flex-1 text-[11px] font-medium py-1.5 border rounded-lg transition-colors ${isDeleted ? "bg-red-50 text-red-400 border-red-200 hover:bg-red-100" : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-red-200 hover:text-red-400"}`}>
                                            {isDeleted ? "✓ Deleted" : "Deleted?"}
                                          </button>
                                          <button onClick={() => { setOpenDropdown(null); openEditModal({ client: c, visits }); }}
                                            className="flex-1 text-[11px] font-medium py-1.5 bg-blue-50 text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                                          <button onClick={() => { setOpenDropdown(null); deleteClientGroup(visits.map(v => v.id), c.phone, c.email); }}
                                            className="flex-1 text-[11px] font-medium py-1.5 bg-neutral-100 text-neutral-400 border border-neutral-200 rounded-lg hover:bg-neutral-200 transition-colors">Del</button>
                                        </div>
                                        <div className="px-4 pb-2">
                                          <button onClick={() => setOpenDropdown(null)} className="text-[10px] text-neutral-300 hover:text-neutral-500">Close</button>
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                );
                              })()}
                            </>
                          );
                        })()}
                      </>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel h-screen flex flex-col bg-neutral-50 overflow-hidden">
      {/* New data toast */}
      {newDataToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-[#1C1C1C] text-white px-5 py-3 shadow-lg">
          <span className="text-[11px] tracking-wide">新資料已更新</span>
          <button onClick={() => setNewDataToast(false)} className="text-white/50 hover:text-white text-[13px]">✕</button>
        </div>
      )}

      {/* Mobile header */}
      <div className="md:hidden bg-[#1C1C1C] px-4 py-3 flex items-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A84C] w-10 shrink-0">Yee</p>
        <p className="flex-1 text-center text-[12px] font-semibold text-white tracking-wide">{VIEW_LABELS[view]}</p>
        <button onClick={() => setSideOpen(!sideOpen)} className="text-white/50 w-10 text-right text-lg leading-none">☰</button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop always visible, mobile slide-in */}
        <div className={`
          md:relative md:translate-x-0 md:flex
          ${sideOpen ? "flex" : "hidden"}
          fixed inset-y-0 left-0 z-40 md:z-auto
          flex-col
        `}>
          {Sidebar()}
        </div>
        {sideOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSideOpen(false)} />}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
          {view === "dashboard"      && <DashboardView      adminKey={savedKey} />}
          {view === "analytics"     && <AnalyticsView     adminKey={savedKey} />}
          {view === "update-history" && <UpdateHistoryView  adminKey={savedKey} />}
          {view === "calendar"      && <CalendarView    adminKey={savedKey} />}
          {view === "bookings"      && <BookingsView    adminKey={savedKey} onClientClick={(name) => { setView("clients-main"); setClientSearch(name); }} />}
          {(view === "clients-main" || view === "clients-elly") && ClientsView()}
          {view === "automations"   && <AutomationsView adminKey={savedKey} />}
          {view === "reviews"       && <ReviewsView    adminKey={savedKey} />}
          {view === "packages"      && <PackagesView   adminKey={savedKey} />}
          {view === "seo-pages"     && <SEOPagesView />}
        </main>
      </div>

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden flex-shrink-0 bg-white border-t border-neutral-100 flex items-stretch z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {BOTTOM_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setView(tab.id); setClientSearch(""); setAddingClient(false); setSideOpen(false); }}
            className={`flex-1 relative flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors
              ${view === tab.id ? "text-[#1C1C1C]" : "text-neutral-400"}`}
          >
            {view === tab.id && (
              <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-[#C9A84C] rounded-full" />
            )}
            {tab.icon}
            <span className={`text-[9px] uppercase tracking-[0.08em] ${view === tab.id ? "font-semibold text-[#C9A84C]" : ""}`}>
              {tab.label}
            </span>
          </button>
        ))}
        {/* More — opens sidebar */}
        <button
          onClick={() => setSideOpen(!sideOpen)}
          className={`flex-1 relative flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors
            ${sideOpen ? "text-[#1C1C1C]" : "text-neutral-400"}`}
        >
          {sideOpen && (
            <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-[#C9A84C] rounded-full" />
          )}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span className={`text-[9px] uppercase tracking-[0.08em] ${sideOpen ? "font-semibold text-[#C9A84C]" : ""}`}>More</span>
        </button>
      </nav>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import MemberBottomNav from "@/components/MemberBottomNav";

type Booking = {
  id: string;
  date: string;
  time: string;
  service_label: string | null;
  service: string | null;
  status: string;
  duration_min: number | null;
  notes: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pending",     color: "#92400E", bg: "#FEF3C7" },
  confirmed:   { label: "Confirmed",   color: "#065F46", bg: "#D1FAE5" },
  completed:   { label: "Completed",   color: "#1C1C1C", bg: "#F3F4F6" },
  cancelled:   { label: "Cancelled",   color: "#991B1B", bg: "#FEE2E2" },
  "no-show":   { label: "No Show",     color: "#7C3AED", bg: "#EDE9FE" },
  rescheduled: { label: "Rescheduled", color: "#1D4ED8", bg: "#DBEAFE" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [token, setToken] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }
      setToken(session.access_token);

      const res = await fetch("/api/member/bookings", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [router]);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter(b =>
    b.date >= today && !["cancelled", "completed", "no-show"].includes(b.status)
  );
  const past = bookings.filter(b =>
    b.date < today || ["cancelled", "completed", "no-show"].includes(b.status)
  );

  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <header className="bg-[#0F0F0F] px-5 py-4">
        <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
        <p className="text-[10px] text-neutral-500">My Appointments</p>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 pb-28">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-neutral-100 p-1 mb-5">
          {(["upcoming", "past"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                tab === t ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3">✦</p>
            <p className="text-[14px] font-semibold text-[#1C1C1C] mb-1">
              {tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
            </p>
            <p className="text-[12px] text-neutral-400 mb-6">
              {tab === "upcoming" ? "Ready for your next visit?" : "Your appointment history will appear here"}
            </p>
            {tab === "upcoming" && (
              <a href="/"
                className="inline-block px-6 py-3 bg-[#C9A84C] text-[#1C1C1C] text-[12px] font-semibold rounded-xl">
                Book Now
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map(b => {
              const st = STATUS_CONFIG[b.status] ?? { label: b.status, color: "#888", bg: "#F3F4F6" };
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-neutral-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1C1C1C]">
                        {b.service_label ?? b.service ?? "Appointment"}
                      </p>
                      <p className="text-[12px] text-neutral-400 mt-0.5">
                        {formatDate(b.date)}{b.time ? ` at ${b.time}` : ""}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.label}
                    </span>
                  </div>
                  {b.duration_min && (
                    <p className="text-[11px] text-neutral-400">Duration: {b.duration_min} min</p>
                  )}
                  {b.notes && (
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{b.notes}</p>
                  )}
                  {["pending", "confirmed"].includes(b.status) && (
                    <div className="mt-3 pt-3 border-t border-neutral-50">
                      <a href="/en/cancel"
                        className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors">
                        Cancel or reschedule →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Book again */}
        {!loading && (
          <div className="mt-6 text-center">
            <a href="/"
              className="inline-block px-6 py-3 bg-[#C9A84C] text-[#1C1C1C] text-[12px] font-semibold rounded-xl hover:bg-[#b8953d] transition-colors">
              Book an Appointment
            </a>
          </div>
        )}
      </div>

      <MemberBottomNav />
    </div>
  );
}

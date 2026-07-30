"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

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
  client_requests: string | null;
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default function LashRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<LashRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }

      const res = await fetch("/api/member/lash-records", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <header className="bg-[#0F0F0F] px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/member/dashboard")}
          className="text-neutral-400 hover:text-white transition-colors text-[20px] leading-none">←</button>
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
          <p className="text-[10px] text-neutral-500">Lash Passport</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3" style={{ color: "#C9A84C" }}>✦</p>
            <p className="text-[14px] font-semibold text-[#1C1C1C] mb-1">No lash records yet</p>
            <p className="text-[12px] text-neutral-400">
              Your lash history will appear here after each visit
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r, i) => (
              <div key={r.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                {/* Date header */}
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: i === 0 ? "linear-gradient(135deg, #1C1C1C 0%, #2D2008 100%)" : "#F9F9F9" }}>
                  <div>
                    <p className={`text-[11px] uppercase tracking-[0.12em] mb-0.5 ${i === 0 ? "text-[#C9A84C]" : "text-neutral-400"}`}>
                      {i === 0 ? "Most Recent" : `Visit ${records.length - i}`}
                    </p>
                    <p className={`text-[15px] font-semibold ${i === 0 ? "text-white" : "text-[#1C1C1C]"}`}>
                      {formatDate(r.service_date)}
                    </p>
                  </div>
                  {r.service_type && (
                    <span className={`text-[11px] font-semibold ${i === 0 ? "text-neutral-300" : "text-neutral-500"}`}>
                      {r.service_type}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="px-4 py-3">
                  {/* Specs grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                    {[
                      { label: "Material", value: r.material },
                      { label: "Style", value: r.style },
                      { label: "Length", value: r.length },
                      { label: "Curl", value: r.curl },
                      { label: "Count", value: r.lash_count ? `${r.lash_count} lashes` : null },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label}>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-400 mb-0.5">{f.label}</p>
                        <p className="text-[12px] font-semibold text-[#1C1C1C]">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {r.client_requests && (
                    <div className="mt-2 pt-2 border-t border-neutral-50">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Your Requests</p>
                      <p className="text-[12px] text-neutral-600">{r.client_requests}</p>
                    </div>
                  )}
                  {r.technician_notes && (
                    <div className="mt-2 pt-2 border-t border-neutral-50">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mb-1">Technician Notes</p>
                      <p className="text-[12px] text-neutral-600">{r.technician_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

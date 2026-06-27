"use client";
import { useState, useEffect } from "react";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  review_date: string | null;
  review_text: string | null;
  platform: string;
  responded: boolean;
  deleted_from_google: boolean;
  notes: string | null;
};

const EMPTY: Omit<Review, "id"> = {
  reviewer_name: "", rating: 5, review_date: "", review_text: "",
  platform: "google", responded: false, deleted_from_google: false, notes: "",
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[#C9A84C] tracking-tight text-[14px]">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

export default function ReviewsView({ adminKey }: { adminKey: string }) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);
  const [adding,  setAdding]    = useState(false);
  const [editing, setEditing]   = useState<string | null>(null);
  const [draft,   setDraft]     = useState<Omit<Review,"id">>(EMPTY);
  const [search,       setSearch]       = useState("");
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<"active" | "deleted">("active");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` };

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reviews", { headers });
    if (res.ok) { setReviews(await res.json()); setError(null); }
    else setError("Could not load reviews. Make sure the 'reviews' table exists in Supabase.");
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!draft.reviewer_name.trim()) { alert("Reviewer name is required."); return; }
    if (editing) {
      const res = await fetch("/api/reviews", { method: "PATCH", headers, body: JSON.stringify({ id: editing, ...draft }) });
      if (res.ok) { const r = await res.json(); setReviews(prev => prev.map(x => x.id === editing ? r : x)); setEditing(null); }
    } else {
      const res = await fetch("/api/reviews", { method: "POST", headers, body: JSON.stringify(draft) });
      if (res.ok) { const r = await res.json(); setReviews(prev => [r, ...prev]); setAdding(false); }
    }
    setDraft(EMPTY);
  }

  async function toggleResponded(review: Review) {
    const res = await fetch("/api/reviews", {
      method: "PATCH", headers,
      body: JSON.stringify({ id: review.id, responded: !review.responded }),
    });
    if (res.ok) { const r = await res.json(); setReviews(prev => prev.map(x => x.id === r.id ? r : x)); }
  }

  async function toggleDeleted(review: Review) {
    const res = await fetch("/api/reviews", {
      method: "PATCH", headers,
      body: JSON.stringify({ id: review.id, deleted_from_google: !review.deleted_from_google }),
    });
    if (res.ok) { const r = await res.json(); setReviews(prev => prev.map(x => x.id === r.id ? r : x)); }
  }

  async function del(id: string) {
    if (!confirm("Delete this review?")) return;
    const res = await fetch("/api/reviews", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    if (res.ok) setReviews(prev => prev.filter(r => r.id !== id));
  }

  const deletedCount = reviews.filter(r => r.deleted_from_google).length;
  const activeCount  = reviews.length - deletedCount;

  const visible = reviews.filter(r => {
    if (activeTab === "deleted" && !r.deleted_from_google) return false;
    if (activeTab === "active"  &&  r.deleted_from_google) return false;
    if (!search) return true;
    return [r.reviewer_name, r.review_text, r.notes]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
  });

  const googleReviews = reviews.filter(r => r.platform === "google");
  const lastSyncDate = googleReviews
    .map(r => r.review_date)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white shrink-0">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1C1C1C]">Google Reviews</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {activeCount} reviews · ★ 5.0 avg
            {deletedCount > 0 && <span className="ml-1.5 text-red-300">· {deletedCount} deleted</span>}
            {lastSyncDate && <span className="ml-2 text-neutral-300">· Last synced: {lastSyncDate}</span>}
          </p>
        </div>
        <button onClick={() => { setDraft(EMPTY); setAdding(true); setEditing(null); }}
          className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] bg-[#C9A84C] text-white rounded-xl hover:opacity-80 transition-all">
          + Add Review
        </button>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {/* Toolbar */}
        {/* Tabs */}
        <div className="bg-white px-6 border-b border-neutral-100 flex gap-0 shrink-0">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors ${activeTab === "active" ? "border-[#C9A84C] text-[#1C1C1C]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("deleted")}
            className={`px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors ${activeTab === "deleted" ? "border-red-400 text-red-500" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
            Deleted {deletedCount > 0 && `(${deletedCount})`}
          </button>
        </div>
        <div className="bg-white px-6 py-3 border-b border-neutral-100 flex gap-3 shrink-0 items-center">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews…"
            className="flex-1 bg-neutral-50 border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
        </div>

        {/* Add / Edit form */}
        {(adding || editing) && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-5 shrink-0">
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#C9A84C] mb-4">
              {editing ? "Edit Review" : "Add Review"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Reviewer Name *</label>
                <input value={draft.reviewer_name} onChange={e => setDraft(p => ({ ...p, reviewer_name: e.target.value }))}
                  className="w-full bg-white border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Date</label>
                <input type="date" value={draft.review_date ?? ""} onChange={e => setDraft(p => ({ ...p, review_date: e.target.value }))}
                  className="w-full bg-white border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Rating</label>
                <select value={draft.rating} onChange={e => setDraft(p => ({ ...p, rating: Number(e.target.value) }))}
                  className="w-full bg-white border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n>1?"s":""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Platform</label>
                <select value={draft.platform} onChange={e => setDraft(p => ({ ...p, platform: e.target.value }))}
                  className="w-full bg-white border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]">
                  <option value="google">Google</option>
                  <option value="yelp">Yelp</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Review Text</label>
                <textarea value={draft.review_text ?? ""} onChange={e => setDraft(p => ({ ...p, review_text: e.target.value }))}
                  rows={3} className="w-full bg-white border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C] resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Notes (internal)</label>
                <input value={draft.notes ?? ""} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. replied on Google, follow up needed…"
                  className="w-full bg-white border border-neutral-200 px-3 py-2 text-[13px] rounded-xl focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="flex items-center gap-2 col-span-1">
                <input type="checkbox" id="responded" checked={draft.responded}
                  onChange={e => setDraft(p => ({ ...p, responded: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#C9A84C]" />
                <label htmlFor="responded" className="text-[12px] text-neutral-600">Responded</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={save}
                className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#C9A84C] text-white rounded-xl hover:opacity-80 transition-all">
                Save
              </button>
              <button onClick={() => { setAdding(false); setEditing(null); setDraft(EMPTY); }}
                className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-neutral-100 text-neutral-500 rounded-xl hover:bg-neutral-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <p className="text-[12px] text-red-600">{error}</p>
            <p className="text-[11px] text-red-400 mt-1">Run this SQL in Supabase to create the table:</p>
            <pre className="mt-2 text-[10px] bg-red-100 p-3 rounded-lg text-red-700 overflow-x-auto">{`create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  rating int2 default 5,
  review_date date,
  review_text text,
  platform text default 'google',
  responded boolean default false,
  notes text,
  created_at timestamptz default now()
);`}</pre>
          </div>
        )}

        {/* Loading */}
        {loading && <p className="px-6 py-12 text-[13px] text-neutral-300 text-center">Loading…</p>}

        {/* Reviews list */}
        {!loading && !error && (
          <div className="divide-y divide-neutral-50">
            {visible.length === 0 && (
              <p className="py-16 text-center text-[13px] text-neutral-300">
                {reviews.length === 0 ? "No reviews yet. Click + Add Review to get started." : "No reviews match your search."}
              </p>
            )}
            {visible.map(r => (
              <div key={r.id} className={`px-6 py-4 hover:bg-[#FAFAF8] transition-colors ${r.deleted_from_google ? "opacity-50" : r.responded ? "" : "bg-amber-50/30"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`text-[14px] font-semibold ${r.deleted_from_google ? "line-through text-neutral-400" : "text-[#1C1C1C]"}`}>{r.reviewer_name}</span>
                      <Stars n={r.rating ?? 5} />
                      <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                        {r.platform}
                      </span>
                      {r.deleted_from_google && (
                        <span className="text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-red-100 text-red-400 border border-red-200">
                          Deleted from Google
                        </span>
                      )}
                    </div>
                    {r.review_text && (
                      <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        className="text-[13px] text-neutral-600 text-left leading-relaxed hover:text-neutral-800 transition-colors w-full">
                        <span className={expanded === r.id ? "whitespace-pre-wrap" : "line-clamp-2"}>{r.review_text}</span>
                        {r.review_text.length > 120 && (
                          <span className="text-[11px] text-[#C9A84C] ml-1">{expanded === r.id ? "show less" : "show more"}</span>
                        )}
                      </button>
                    )}
                    {r.notes && (
                      <p className="mt-1.5 text-[11px] text-neutral-400 italic">Note: {r.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleDeleted(r)}
                      title={r.deleted_from_google ? "Mark as active" : "Mark as deleted from Google"}
                      className={`text-[10px] px-3 py-1.5 border rounded-lg transition-colors ${r.deleted_from_google ? "bg-red-50 text-red-400 border-red-200 hover:bg-red-100" : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-red-200 hover:text-red-400"}`}>
                      {r.deleted_from_google ? "✓ Deleted" : "Deleted?"}
                    </button>
                    <button onClick={() => { setEditing(r.id); setDraft({ reviewer_name: r.reviewer_name, rating: r.rating, review_date: r.review_date ?? "", review_text: r.review_text ?? "", platform: r.platform, responded: r.responded, deleted_from_google: r.deleted_from_google, notes: r.notes ?? "" }); setAdding(false); }}
                      className="text-[10px] px-3 py-1.5 bg-blue-50 text-blue-400 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => del(r.id)}
                      className="text-[10px] px-3 py-1.5 bg-neutral-100 text-neutral-400 border border-neutral-200 rounded-lg hover:bg-neutral-200 transition-colors">
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

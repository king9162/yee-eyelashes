"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function MemberProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [birthdayLocked, setBirthdayLocked] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }
      setToken(session.access_token);

      const { data: p } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, birthday, birthday_set_at, email, member_id")
        .eq("id", session.user.id)
        .single();

      if (p) {
        setFirstName(p.first_name ?? "");
        setLastName(p.last_name ?? "");
        setPhone(p.phone ?? "");
        setBirthday(p.birthday ?? "");
        setEmail(p.email ?? session.user.email ?? "");
        setMemberId(p.member_id ?? "");
        // Lock birthday if already set (prevent abuse)
        if (p.birthday_set_at) setBirthdayLocked(true);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  async function save() {
    setError(""); setSuccess(false);
    if (!firstName.trim()) { setError("Please enter your first name."); return; }

    setSaving(true);
    const body: Record<string, string> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
    };
    if (!birthdayLocked && birthday) body.birthday = birthday;

    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      {/* Header */}
      <header className="bg-[#0F0F0F] px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/member/dashboard")}
          className="text-neutral-400 hover:text-white transition-colors text-[20px] leading-none">
          ←
        </button>
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase">Yee Eyelashes</p>
          <p className="text-[10px] text-neutral-500">Edit Profile</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Member ID badge */}
        <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-[12px] text-neutral-400">Member ID</p>
          <p className="text-[13px] font-semibold text-[#1C1C1C]">{memberId}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Betty"
                className="w-full border border-[#D4CCC0] rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith"
                className="w-full border border-[#D4CCC0] rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Email</label>
            <input value={email} readOnly
              className="w-full border border-[#E8E4DC] rounded-xl px-3.5 py-3 text-[13px] bg-neutral-50 text-neutral-400 cursor-not-allowed" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(516) 000-0000" type="tel"
              className="w-full border border-[#D4CCC0] rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">
              Birthday
              {birthdayLocked && <span className="ml-2 text-neutral-300 normal-case tracking-normal">(locked after first save)</span>}
              {!birthdayLocked && <span className="ml-2 text-[#C9A84C] normal-case tracking-normal">✦ unlocks your 30% birthday reward</span>}
            </label>
            <input value={birthday} onChange={e => setBirthday(e.target.value)} type="date" disabled={birthdayLocked}
              className={`w-full border rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:border-[#C9A84C] transition-colors ${
                birthdayLocked ? "border-[#E8E4DC] bg-neutral-50 text-neutral-400 cursor-not-allowed" : "border-[#D4CCC0]"
              }`} />
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}
          {success && <p className="text-[12px] text-green-600 font-semibold">Profile updated ✓</p>}

          <button onClick={save} disabled={saving}
            className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

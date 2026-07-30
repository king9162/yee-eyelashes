"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/member/login"); return; }

      setToken(session.access_token);

      // Pre-fill from existing profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, birthday")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setPhone(profile.phone ?? "");
        setBirthday(profile.birthday ?? "");

        // Already completed onboarding
        if (profile.phone && profile.birthday) {
          router.replace("/member/dashboard");
          return;
        }
      }

      setLoading(false);
    }
    init();
  }, [router]);

  async function save() {
    setError("");
    if (!firstName.trim()) { setError("Please enter your first name."); return; }
    if (!phone.trim()) { setError("Please enter your phone number."); return; }
    if (!birthday) { setError("Please enter your birthday to unlock your birthday reward."); return; }

    setSaving(true);
    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), birthday }),
    });
    setSaving(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.replace("/member/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col items-center justify-center px-4 py-10"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/images/yee-logo-v1-cropped.png" alt="Yee Eyelashes" width={140} height={56} className="object-contain" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A84C" }}>
            Welcome
          </p>
          <h1 className="text-[32px] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-cormorant)" }}>
            Set Up Your Profile
          </h1>
          <p className="text-[12px] text-neutral-400 mt-2 leading-relaxed">
            Just a few details — so we can personalize your experience<br />and send your birthday reward.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">First Name</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Betty"
                className="w-full border border-[#D4CCC0] bg-white rounded-xl px-3.5 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Last Name</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Smith"
                className="w-full border border-[#D4CCC0] bg-white rounded-xl px-3.5 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Phone Number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(516) 000-0000"
              type="tel"
              className="w-full border border-[#D4CCC0] bg-white rounded-xl px-3.5 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">
              Birthday
              <span className="ml-2 text-[#C9A84C] normal-case tracking-normal">✦ unlocks your 30% birthday reward</span>
            </label>
            <input
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              type="date"
              className="w-full border border-[#D4CCC0] bg-white rounded-xl px-3.5 py-3 text-[13px] text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
            style={{ background: "#1C1C1C", color: "#fff" }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#C9A84C"; (e.currentTarget as HTMLButtonElement).style.color = "#1C1C1C"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1C1C1C"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          >
            {saving ? "Saving…" : "Complete Setup →"}
          </button>

          <button
            onClick={() => router.replace("/member/dashboard")}
            className="w-full text-center text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

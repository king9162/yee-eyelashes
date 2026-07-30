"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";

export default function MemberLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/member/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      setError("Sign in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#F8F5EF", fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/images/yee-logo-v1-cropped.png"
            alt="Yee Eyelashes"
            width={120}
            height={48}
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: "#C9A84C" }}
          >
            Member Club
          </p>
          <h1
            className="text-[40px] font-light leading-tight text-[#1C1C1C] mb-3"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Yee Eyelashes
          </h1>
          <p className="text-[13px] text-neutral-500 whitespace-nowrap">
            Points · Birthday Perks · Exclusive VIP Benefits
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#E0D9CF]" />
          <span className="text-[10px] text-neutral-400 tracking-[0.15em] uppercase">Sign in</span>
          <div className="flex-1 h-px bg-[#E0D9CF]" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#D4CCC0] bg-white text-[#1C1C1C] font-semibold text-[13px] hover:border-[#C9A84C] hover:shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="text-neutral-400">Redirecting…</span>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {error && (
          <p className="text-center text-[12px] text-red-500 mt-3">{error}</p>
        )}

        {/* Benefits */}
        <div className="mt-8 space-y-2.5">
          {[
            "Earn 1 point per $1 spent — 100 pts = $1 off",
            "30% birthday discount every year",
            "Advance to Silver, Gold & Diamond tiers",
            "Priority booking & exclusive coupons",
          ].map((b) => (
            <div key={b} className="flex items-start gap-2.5">
              <span className="text-[#C9A84C] text-[9px] mt-1 flex-shrink-0">✦</span>
              <p className="text-[12px] text-neutral-500 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-neutral-400 mt-8">
          By signing in you agree to our{" "}
          <a href="/en/terms" className="underline hover:text-neutral-600">Terms</a>
          {" "}&amp;{" "}
          <a href="/en/privacy" className="underline hover:text-neutral-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab]           = useState<"google" | "email">("google");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) sessionStorage.setItem("pending_ref", ref);
  }, [searchParams]);

  async function signInWithGoogle() {
    setLoading(true); setError("");
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/member/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) { setError("Sign in failed. Please try again."); setLoading(false); }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === "Email not confirmed"
        ? "Please verify your email first. Check your inbox for a confirmation link."
        : error.message.includes("Invalid login")
        ? "Incorrect email or password."
        : "Sign in failed. Please try again.");
      setLoading(false);
    } else {
      router.replace("/member/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#F8F5EF", fontFamily: "var(--font-montserrat), sans-serif" }}>
      <div className="w-full max-w-[380px]">

        <div className="flex justify-center mb-10">
          <Image src="/images/yee-logo-v1-cropped.png" alt="Yee Eyelashes" width={360} height={144}
            className="w-[180px] sm:w-[240px] object-contain" />
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A84C" }}>Member Club</p>
          <h1 className="text-[38px] font-light leading-tight text-[#1C1C1C] mb-2"
            style={{ fontFamily: "var(--font-cormorant)" }}>Yee Eyelashes</h1>
          <p className="text-[12px] text-neutral-400">Every 5 Visits · Birthday Reward · Exclusive VIP Benefits</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border border-[#D4CCC0] mb-6 bg-white">
          {(["google", "email"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                tab === t ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-700"
              }`}>
              {t === "google" ? "Google" : "Email"}
            </button>
          ))}
        </div>

        {tab === "google" ? (
          <button onClick={signInWithGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#D4CCC0] bg-white text-[#1C1C1C] font-semibold text-[13px] hover:border-[#C9A84C] hover:shadow-sm transition-all disabled:opacity-50">
            {loading
              ? <span className="text-neutral-400 text-[12px]">Redirecting…</span>
              : <><GoogleIcon />Continue with Google</>}
          </button>
        ) : (
          <form onSubmit={signInWithEmail} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors pr-11" />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors">
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {error && <p className="text-[12px] text-red-500">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-1">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                : "Sign In"}
            </button>

            <div className="flex items-center justify-between pt-1">
              <Link href="/member/forgot-password"
                className="text-[11px] text-neutral-400 hover:text-[#C9A84C] transition-colors">
                Forgot your password?
              </Link>
              <Link href="/member/signup"
                className="text-[11px] text-[#C9A84C] font-semibold hover:underline transition-colors">
                Create account →
              </Link>
            </div>
          </form>
        )}

        {tab === "google" && (
          <div className="mt-8 space-y-2.5">
            {["Every 5 visits → 20% off coupon, automatically",
              "Birthday reward, 30% off every year",
              "Silver, Gold & Diamond tiers unlocked by visits",
              "Priority booking & exclusive coupons"].map(b => (
              <div key={b} className="flex items-start gap-2.5">
                <span className="text-[#C9A84C] text-[9px] mt-1 flex-shrink-0">✦</span>
                <p className="text-[12px] text-neutral-500 leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        )}

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

export default function MemberLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
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

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"phone" | "email" | "google">("phone");

  // Phone OTP state
  const [phone, setPhone]           = useState("");
  const [otpSent, setOtpSent]       = useState(false);
  const [otp, setOtp]               = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying]   = useState(false);

  // Email state
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Google state
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) sessionStorage.setItem("pending_ref", ref);
  }, [searchParams]);

  function formatPhone(raw: string) {
    // Strip non-digits, prepend +1 if no country code
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
    if (digits.length === 10) return `+1${digits}`;
    if (raw.startsWith("+")) return raw.replace(/\s/g, "");
    return `+1${digits}`;
  }

  async function sendOtp() {
    const formatted = formatPhone(phone);
    if (formatted.length < 12) { setError("Please enter a valid US phone number."); return; }
    setSendingOtp(true); setError("");
    const { error } = await getSupabase().auth.signInWithOtp({ phone: formatted });
    setSendingOtp(false);
    if (error) {
      setError(error.message.includes("not enabled")
        ? "SMS login is not enabled yet. Please use Email or Google."
        : "Failed to send code. Please try again.");
    } else {
      setOtpSent(true);
    }
  }

  async function verifyOtp() {
    if (!otp.trim()) { setError("Please enter the 6-digit code."); return; }
    setVerifying(true); setError("");
    const formatted = formatPhone(phone);
    const { error } = await getSupabase().auth.verifyOtp({
      phone: formatted,
      token: otp.trim(),
      type: "sms",
    });
    setVerifying(false);
    if (error) {
      setError("Incorrect or expired code. Please try again.");
    } else {
      router.replace("/member/dashboard");
    }
  }

  async function signInWithGoogle() {
    setLoadingGoogle(true); setError("");
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/member/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) { setError("Sign in failed. Please try again."); setLoadingGoogle(false); }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoadingEmail(true); setError("");
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === "Email not confirmed"
        ? "Please verify your email first. Check your inbox for a confirmation link."
        : error.message.includes("Invalid login")
        ? "Incorrect email or password."
        : "Sign in failed. Please try again.");
      setLoadingEmail(false);
    } else {
      router.replace("/member/dashboard");
    }
  }

  function switchTab(t: typeof tab) {
    setTab(t);
    setError("");
    setOtpSent(false);
    setOtp("");
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
          {(["phone", "email", "google"] as const).map(t => (
            <button key={t} onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                tab === t ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-700"
              }`}>
              {t === "phone" ? "Phone" : t === "email" ? "Email" : "Google"}
            </button>
          ))}
        </div>

        {/* Phone OTP */}
        {tab === "phone" && (
          <div className="space-y-3">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(516) 000-0000"
                    autoComplete="tel"
                    className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1.5 text-center">US numbers only · We&apos;ll text you a 6-digit code</p>
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button onClick={sendOtp} disabled={sendingOtp || !phone.trim()}
                  className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-1">
                  {sendingOtp
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    : "Send Code"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                      6-Digit Code
                    </label>
                    <button onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                      className="text-[11px] text-[#C9A84C] hover:underline">
                      Change number
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-2">Sent to {phone}</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[16px] font-mono tracking-[0.4em] text-[#1C1C1C] text-center placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button onClick={verifyOtp} disabled={verifying || otp.length < 6}
                  className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-1">
                  {verifying
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying…
                      </span>
                    : "Verify & Sign In"}
                </button>

                <button onClick={sendOtp} disabled={sendingOtp}
                  className="w-full text-center text-[11px] text-neutral-400 hover:text-[#C9A84C] transition-colors py-1 disabled:opacity-50">
                  {sendingOtp ? "Resending…" : "Resend code"}
                </button>
              </>
            )}

            <div className="mt-6 space-y-2.5">
              {["Every 5 visits → 20% off coupon, automatically",
                "Birthday reward, 20% off every year",
                "Silver, Gold & Diamond tiers unlocked by visits",
                "Priority booking & exclusive coupons"].map(b => (
                <div key={b} className="flex items-start gap-2.5">
                  <span className="text-[#C9A84C] text-[9px] mt-1 flex-shrink-0">✦</span>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        {tab === "email" && (
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

            <button type="submit" disabled={loadingEmail}
              className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-1">
              {loadingEmail
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

        {/* Google */}
        {tab === "google" && (
          <div>
            <button onClick={signInWithGoogle} disabled={loadingGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#D4CCC0] bg-white text-[#1C1C1C] font-semibold text-[13px] hover:border-[#C9A84C] hover:shadow-sm transition-all disabled:opacity-50">
              {loadingGoogle
                ? <span className="text-neutral-400 text-[12px]">Redirecting…</span>
                : <><GoogleIcon />Continue with Google</>}
            </button>

            <div className="mt-8 space-y-2.5">
              {["Every 5 visits → 20% off coupon, automatically",
                "Birthday reward, 20% off every year",
                "Silver, Gold & Diamond tiers unlocked by visits",
                "Priority booking & exclusive coupons"].map(b => (
                <div key={b} className="flex items-start gap-2.5">
                  <span className="text-[#C9A84C] text-[9px] mt-1 flex-shrink-0">✦</span>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && tab === "google" && <p className="text-[12px] text-red-500 mt-3">{error}</p>}

        <p className="text-center text-[11px] text-neutral-400 mt-8 leading-relaxed">
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

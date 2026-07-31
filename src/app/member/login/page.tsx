"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");

  // Shared
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Register-only
  const [regStep, setRegStep]         = useState<"phone" | "otp">("phone");
  const [otpToken, setOtpToken]       = useState("");
  const [otpCode, setOtpCode]         = useState("");
  const [otpLoading, setOtpLoading]   = useState(false);
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [birthday, setBirthday]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Forgot password
  const [showForgot, setShowForgot]       = useState(false);
  const [forgotInput, setForgotInput]     = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent]       = useState<{ sms: boolean; email: boolean } | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) sessionStorage.setItem("pending_ref", ref);
  }, [searchParams]);

  function getDigits(raw: string) {
    return raw.replace(/\D/g, "").slice(-10);
  }

  function formatDisplay(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  }

  function onPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatDisplay(e.target.value));
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const digits = getDigits(phone);
    if (digits.length !== 10) { setError("Please enter a valid 10-digit phone number."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true); setError("");
    const syntheticEmail = `p${digits}@yee.member`;
    const { error: err } = await getSupabase().auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message.includes("Invalid login") || err.message.includes("invalid")
        ? "Incorrect phone number or password."
        : "Sign in failed. Please try again.");
    } else {
      router.replace("/member/dashboard");
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = getDigits(phone);
    if (digits.length !== 10) { setError("Please enter a valid 10-digit phone number."); return; }
    setOtpLoading(true); setError("");
    const res = await fetch("/api/member/send-phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: digits }),
    });
    const d = await res.json();
    setOtpLoading(false);
    if (!res.ok) { setError(d.error ?? "Failed to send code. Please try again."); return; }
    setOtpToken(d.token);
    setOtpCode("");
    setRegStep("otp");
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim()) { setError("Please enter the verification code."); return; }
    if (!firstName.trim()) { setError("Please enter your first name."); return; }
    if (!birthday) { setError("Please enter your birthday."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true); setError("");
    const digits = getDigits(phone);
    const res = await fetch("/api/member/register-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: digits,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        birthday: birthday || null,
        otp_code: otpCode.trim(),
        otp_token: otpToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Auto sign in
    const syntheticEmail = `p${digits}@yee.member`;
    const { error: signInErr } = await getSupabase().auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });
    setLoading(false);
    if (signInErr) {
      setError("Account created! Please sign in.");
      setMode("signin");
    } else {
      router.replace("/member/dashboard");
    }
  }

  async function sendForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    const input = forgotInput.trim();
    if (!input) { setError("Please enter your phone number or email."); return; }

    setForgotLoading(true); setError("");

    const isEmail = input.includes("@");
    let res: Response;

    if (isEmail) {
      res = await fetch("/api/member/email-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: input }),
      });
    } else {
      const digits = getDigits(input);
      if (digits.length !== 10) {
        setForgotLoading(false);
        setError("Please enter a valid phone number or email address.");
        return;
      }
      res = await fetch("/api/member/phone-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
    }

    const d = await res.json();
    setForgotLoading(false);
    if (!res.ok) { setError(d.error ?? "Something went wrong."); return; }

    setForgotSent({ sms: d.sentSMS === true, email: d.sentEmail === true });
  }

  function switchMode(m: typeof mode) {
    setMode(m); setError("");
    setPassword(""); setConfirm(""); setShowPw(false); setShowConfirm(false);
    setRegStep("phone"); setOtpToken(""); setOtpCode("");
    setForgotSent(null); setForgotInput("");
  }

  const benefits = [
    "Every 5 visits → 20% off coupon, automatically",
    "Birthday reward, 20% off every year",
    "Silver, Gold & Diamond tiers unlocked by visits",
    "Priority booking & exclusive coupons",
  ];

  const inputCls = "w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors";
  const labelCls = "block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
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

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[#D4CCC0] mb-6 bg-white">
          {(["signin", "register"] as const).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                mode === m ? "bg-[#1C1C1C] text-white" : "text-neutral-400 hover:text-neutral-700"
              }`}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* ── Sign In ── */}
        {mode === "signin" && !showForgot && (
          <form onSubmit={signIn} className="space-y-3">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={phone} onChange={onPhoneChange}
                placeholder="(516) 000-0000" autoComplete="tel"
                className={inputCls} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace(" mb-1.5","")}>Password</label>
                <button type="button"
                  onClick={() => { setShowForgot(true); setForgotInput(phone); setForgotDone(null); setError(""); }}
                  className="text-[11px] text-neutral-400 hover:text-[#C9A84C] transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className={inputCls + " pr-11"} />
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

            <div className="mt-6 space-y-2.5">
              {benefits.map(b => (
                <div key={b} className="flex items-start gap-2.5">
                  <span className="text-[#C9A84C] text-[9px] mt-1 flex-shrink-0">✦</span>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </form>
        )}

        {/* ── Forgot Password ── */}
        {mode === "signin" && showForgot && (
          <div className="space-y-3">
            <button type="button" onClick={() => { setShowForgot(false); setForgotSent(null); setForgotInput(""); setError(""); }}
              className="text-[11px] text-[#C9A84C] hover:underline flex items-center gap-1 mb-2">
              ← Back to sign in
            </button>

            {!forgotSent ? (
              <form onSubmit={sendForgotPassword} className="space-y-3">
                <div className="text-center mb-4">
                  <p className="text-[14px] font-semibold text-[#1C1C1C] mb-1">Reset Password</p>
                  <p className="text-[12px] text-neutral-400 leading-relaxed">
                    Enter your phone number or email — we&apos;ll send a reset link.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Phone Number or Email</label>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={e => setForgotInput(e.target.value)}
                    placeholder="(516) 000-0000  or  you@example.com"
                    autoComplete="off"
                    className={inputCls}
                  />
                </div>
                {error && <p className="text-[12px] text-red-500">{error}</p>}
                <button type="submit" disabled={forgotLoading || !forgotInput.trim()}
                  className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50">
                  {forgotLoading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    : "Send Reset Link"}
                </button>
              </form>
            ) : (forgotSent.sms || forgotSent.email) ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#FEF9EC", border: "1px solid #F0DFA0" }}>
                  <span className="text-[20px]">{forgotSent.email ? "✉️" : "💬"}</span>
                </div>
                <p className="text-[14px] font-semibold text-[#1C1C1C] mb-2">Reset link sent!</p>
                <p className="text-[12px] text-neutral-400 leading-relaxed">
                  {forgotSent.sms && forgotSent.email
                    ? "We sent a password reset link via text message and email. Click the link to set a new password."
                    : forgotSent.sms
                    ? "We sent a password reset link to your phone via text message. Click the link to set a new password."
                    : "We sent a password reset link to your email on file. Click the link to set a new password."}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#F8F5EF", border: "1px solid #D4CCC0" }}>
                  <span className="text-[20px]">🔍</span>
                </div>
                <p className="text-[14px] font-semibold text-[#1C1C1C] mb-2">No account found</p>
                <p className="text-[12px] text-neutral-400 leading-relaxed">
                  We couldn&apos;t find an account with that info. Please contact the salon for help.
                </p>
                <a href="tel:+15168696000"
                  className="inline-block mt-4 px-6 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
                  Call Yee Eyelashes
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── Create Account: Step 1 — Enter Phone ── */}
        {mode === "register" && regStep === "phone" && (
          <form onSubmit={sendOtp} className="space-y-3">
            <div>
              <label className={labelCls}>Phone Number <span className="text-red-400">*</span></label>
              <input type="tel" value={phone} onChange={onPhoneChange}
                placeholder="(516) 000-0000" autoComplete="tel"
                className={inputCls} />
            </div>

            {error && <p className="text-[12px] text-red-500">{error}</p>}

            <button type="submit" disabled={otpLoading}
              className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-1">
              {otpLoading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending code…
                  </span>
                : "Send Verification Code"}
            </button>

            <p className="text-[11px] text-neutral-400 text-center mt-2">
              We&apos;ll text a 6-digit code to verify your number.
            </p>
          </form>
        )}

        {/* ── Create Account: Step 2 — Code + Form ── */}
        {mode === "register" && regStep === "otp" && (
          <form onSubmit={register} className="space-y-3">
            {/* Locked phone + change link */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#D4CCC0] rounded-xl">
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-0.5">Phone</p>
                <p className="text-[13px] text-[#1C1C1C] font-semibold">{phone}</p>
              </div>
              <button type="button"
                onClick={() => { setRegStep("phone"); setOtpToken(""); setOtpCode(""); setError(""); }}
                className="text-[11px] text-[#C9A84C] hover:underline">
                Change
              </button>
            </div>

            {/* Verification code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace(" mb-1.5","")}>
                  Verification Code <span className="text-red-400">*</span>
                </label>
                <button type="button" onClick={sendOtp}
                  className="text-[11px] text-neutral-400 hover:text-[#C9A84C] transition-colors">
                  Resend code
                </button>
              </div>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0,6))}
                placeholder="6-digit code"
                className={inputCls + " tracking-widest text-center text-[18px]"} />
              <p className="text-[11px] text-neutral-400 mt-1">Code sent to {phone}. Valid for 10 minutes.</p>
            </div>

            <div className="pt-1 border-t border-[#D4CCC0]" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>First Name <span className="text-red-400">*</span></label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane" autoComplete="given-name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder="Smith" autoComplete="family-name" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Birthday <span className="text-red-400">*</span>
                <span className="text-neutral-300 normal-case tracking-normal ml-1">(for birthday coupon)</span>
              </label>
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>
                Email <span className="text-neutral-300 normal-case tracking-normal">(optional)</span>
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters" autoComplete="new-password"
                  className={inputCls + " pr-11"} />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors">
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  className={`w-full border bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none transition-colors pr-11 ${
                    confirm && confirm !== password ? "border-red-300 focus:border-red-400" : "border-[#D4CCC0] focus:border-[#C9A84C]"
                  }`} />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors">
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {error && <p className="text-[12px] text-red-500">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-1">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </span>
                : "Create Account"}
            </button>
          </form>
        )}

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

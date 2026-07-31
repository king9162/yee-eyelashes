"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Strong", "Very strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#22C55E", "#16A34A"];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= score ? colors[score] : "#E5E7EB" }} />
        ))}
      </div>
      <p className="text-[10px]" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/member/confirm-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const d = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(d.error ?? "Something went wrong. Please request a new reset link.");
    } else {
      setDone(true);
      setTimeout(() => router.replace("/member/login"), 2500);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
        <div className="w-full max-w-[380px] text-center">
          <div className="flex justify-center mb-10">
            <Image src="/images/yee-logo-v1-cropped.png" alt="Yee Eyelashes" width={200} height={80}
              className="w-[160px] object-contain" />
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <span className="text-[22px]">✓</span>
          </div>
          <h1 className="text-[32px] font-light text-[#1C1C1C] mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
            Password updated
          </h1>
          <p className="text-[13px] text-neutral-500">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
        <div className="w-full max-w-[380px] text-center">
          <div className="flex justify-center mb-10">
            <Image src="/images/yee-logo-v1-cropped.png" alt="Yee Eyelashes" width={200} height={80}
              className="w-[160px] object-contain" />
          </div>
          <p className="text-[13px] text-neutral-500 mb-4">This reset link is invalid or has expired.</p>
          <a href="/member/login"
            className="inline-block px-6 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col items-center justify-center px-4 py-10"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-10">
          <Image src="/images/yee-logo-v1-cropped.png" alt="Yee Eyelashes" width={360} height={144}
            className="w-[160px] object-contain" />
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A84C" }}>Member Club</p>
          <h1 className="text-[36px] font-light text-[#1C1C1C] mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
            New Password
          </h1>
          <p className="text-[12px] text-neutral-400">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" autoComplete="new-password"
                className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors pr-11" />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors">
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" autoComplete="new-password"
              className={`w-full border bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none transition-colors ${
                confirm && confirm !== password ? "border-red-300 focus:border-red-400" : "border-[#D4CCC0] focus:border-[#C9A84C]"
              }`} />
            {confirm && confirm !== password && (
              <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <button type="submit" disabled={loading || !password || !confirm}
            className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-2">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating…
                </span>
              : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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

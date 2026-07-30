"use client";
import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/member/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError("Something went wrong. Please try again.");
    } else {
      setDone(true);
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
            style={{ background: "#FEF9EC", border: "1px solid #F0DFA0" }}>
            <span className="text-[22px]">✉️</span>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A84C" }}>Check your inbox</p>
          <h1 className="text-[32px] font-light text-[#1C1C1C] mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
            Reset link sent
          </h1>
          <p className="text-[13px] text-neutral-500 leading-relaxed mb-8">
            We sent a password reset link to<br />
            <strong className="text-[#1C1C1C]">{email}</strong>.<br /><br />
            Click the link in the email to set a new password.
          </p>
          <Link href="/member/login"
            className="inline-block px-8 py-3 rounded-xl text-[12px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all">
            Back to Sign In
          </Link>
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
            Forgot Password
          </h1>
          <p className="text-[12px] text-neutral-400">Enter your email and we&apos;ll send a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-neutral-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className="w-full border border-[#D4CCC0] bg-white rounded-xl px-4 py-3 text-[13px] text-[#1C1C1C] placeholder:text-neutral-300 focus:outline-none focus:border-[#C9A84C] transition-colors" />
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all disabled:opacity-50 mt-2">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </span>
              : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-[12px] text-neutral-400 mt-6">
          Remember your password?{" "}
          <Link href="/member/login" className="text-[#C9A84C] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

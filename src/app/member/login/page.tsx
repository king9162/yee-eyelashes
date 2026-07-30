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
      setError("登入失敗，請稍後再試");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/yee-logo-og.png"
            alt="Yee Eyelashes"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.25em] text-[#C9A84C] uppercase mb-2 font-montserrat">
            Member Club
          </p>
          <h1
            className="text-[36px] font-light text-white leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Yee Eyelashes
          </h1>
          <p className="text-[13px] text-neutral-400 mt-3 font-montserrat leading-relaxed">
            登入會員，查看點數、生日優惠<br />與專屬 VIP 福利
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#1C1C1C] font-semibold text-[14px] py-3.5 rounded-xl hover:bg-neutral-100 transition-all disabled:opacity-50 font-montserrat"
        >
          {loading ? (
            <span className="text-neutral-500">跳轉中…</span>
          ) : (
            <>
              <GoogleIcon />
              使用 Google 帳號登入
            </>
          )}
        </button>

        {error && (
          <p className="text-center text-[12px] text-red-400 mt-3">{error}</p>
        )}

        {/* Benefits */}
        <div className="mt-10 space-y-3">
          {[
            { icon: "✦", text: "消費每 $1 賺 1 點，100 點折抵 $1" },
            { icon: "✦", text: "生日月享 30% 折扣禮遇" },
            { icon: "✦", text: "累積晉升 Silver · Gold · Diamond" },
            { icon: "✦", text: "優先預約 · 專屬優惠券" },
          ].map((b) => (
            <div key={b.text} className="flex items-start gap-3">
              <span className="text-[#C9A84C] text-[10px] mt-0.5 flex-shrink-0">{b.icon}</span>
              <p className="text-[12px] text-neutral-400 font-montserrat leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-neutral-600 mt-10 font-montserrat">
          登入即代表同意我們的{" "}
          <a href="/en/terms" className="underline hover:text-neutral-400">服務條款</a>
          {" "}與{" "}
          <a href="/en/privacy" className="underline hover:text-neutral-400">隱私政策</a>
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

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function BookingSuccessPage() {
  const params = useParams();
  const lang = params.lang as string;
  const zh = lang === "zh";

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "booking_confirmed",
        page: "booking_success",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-6 pt-[70px]">
      <div className="max-w-[480px] w-full text-center">

        {/* Gold checkmark */}
        <div className="w-16 h-16 border border-[#C9A84C]/40 flex items-center justify-center mx-auto mb-10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <p className="text-[9px] uppercase tracking-[0.55em] text-[#C9A84C] mb-4">
          {zh ? "預約成功" : "Booking Confirmed"}
        </p>

        <h1
          className="text-[2.2rem] font-light text-[#1C1C1C] leading-tight mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {zh ? "感謝您的預約！" : "Thank You!"}
        </h1>

        <p className="text-[13px] text-neutral-500 leading-[1.9] mb-3">
          {zh
            ? "您的預約已確認，確認信已發送至您的電子信箱，並附有 Calendar 邀請。"
            : "Your appointment is confirmed. A confirmation email with a calendar invite has been sent to you."}
        </p>

        <p className="text-[12px] text-neutral-400 leading-[1.8] mb-12">
          {zh
            ? "如需更改或取消，請至少提前 24 小時聯絡我們。"
            : "To reschedule or cancel, please contact us at least 24 hours in advance."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${lang}`}
            className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 border border-neutral-300 px-8 py-3.5 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
          >
            {zh ? "返回首頁" : "Back to Home"}
          </Link>
          <a
            href="tel:9298062467"
            className="text-[10px] uppercase tracking-[0.3em] text-white bg-[#1C1C1C] px-8 py-3.5 hover:bg-[#C9A84C] transition-all duration-300"
          >
            {zh ? "聯絡我們" : "Contact Us"}
          </a>
        </div>

        <p className="mt-12 text-[11px] text-neutral-300">
          📍 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030
        </p>
      </div>
    </div>
  );
}

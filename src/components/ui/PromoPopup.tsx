"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function PromoPopup({ lang }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("promo-dismissed-new-client");
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("promo-dismissed-new-client", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
      onClick={dismiss}
    >
      <div
        className="relative bg-[#F8F5EF] max-w-[480px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div className="h-[3px] bg-[#C9A84C] w-full" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-neutral-400 hover:text-[#1C1C1C] transition-colors text-[20px] leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <div className="px-6 sm:px-10 pt-9 pb-10 text-center">
          {/* Eyebrow */}
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#C9A84C] mb-4">
            {lang === "zh" ? "新客戶專屬優惠" : "New Client Offer"}
          </p>

          {/* Headline */}
          <h2
            className="text-[1.9rem] sm:text-[2.2rem] font-light text-[#1C1C1C] leading-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {lang === "zh" ? "新客戶首次到訪 享 30% 折扣" : "30% Off Your First Visit"}
          </h2>

          {/* Sub-headline */}
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] mb-5">
            {lang === "zh" ? "全線眼睫毛服務" : "All Eyelash Extensions"}
          </p>

          {/* Body */}
          <p className="text-[12px] text-neutral-500 leading-[2] mb-7 mx-auto">
            {lang === "zh"
              ? <>新客戶專屬優惠。<br />折扣於到店時直接套用，無需折扣碼。</>
              : <>New clients.<br />Discount applied on-site, no code required.</>}
          </p>

          {/* CTA */}
          <Link
            href="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="inline-block text-[10px] uppercase tracking-[0.3em] bg-[#1C1C1C] text-white px-10 py-4 hover:bg-[#C9A84C] transition-colors duration-300"
          >
            {lang === "zh" ? "立即預約" : "Book Now"}
          </Link>

          {/* Dismiss link */}
          <p className="mt-6">
            <button
              onClick={dismiss}
              className="text-[10px] text-neutral-300 hover:text-neutral-400 tracking-[0.1em] underline-offset-2 hover:underline transition-colors"
            >
              {lang === "zh" ? "暫不，繼續瀏覽" : "No thanks, continue browsing"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

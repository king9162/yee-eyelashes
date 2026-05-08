"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lang, getTranslations } from "@/i18n";

type Props = { lang: Lang };

export default function MobileBookingBar({ lang }: Props) {
  const t = getTranslations(lang);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#111] border-t border-white/10 flex items-stretch">
        {/* Phone */}
        <a
          href="tel:9298062467"
          aria-label="Call us"
          className="flex items-center justify-center px-5 border-r border-white/10 text-white/60 hover:text-[#C9A84C] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </a>

        {/* Book Now */}
        <Link
          href="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-[10px] uppercase tracking-[0.3em] text-[#1C1C1C] bg-[#C9A84C] py-4 font-medium hover:bg-[#DFC078] transition-colors"
        >
          {t.nav.booking} →
        </Link>
      </div>
    </div>
  );
}

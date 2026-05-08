"use client";

import { useState } from "react";
import { Lang, getTranslations } from "@/i18n";
import Link from "next/link";

type Props = {
  lang: Lang;
};

export default function PromoBanner({ lang }: Props) {
  const t = getTranslations(lang);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="hidden sm:block bg-neutral-900 text-white text-center py-2 px-8 text-[10px] tracking-[0.15em] relative">
      {/* Short version on mobile */}
      <span className="sm:hidden text-neutral-300">
        {lang === "zh" ? "新客 8 折優惠" : "New clients: 20% off"}{" "}
        <Link
          href="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C9A84C] underline underline-offset-2"
        >
          {t.promo.cta}
        </Link>
      </span>
      {/* Full version on larger screens */}
      <span className="hidden sm:inline text-neutral-300">{t.promo.text}</span>
      <span className="hidden sm:inline">
        {" "}
        <Link
          href="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C9A84C] hover:text-[#DFC078] transition-colors ml-2 underline underline-offset-2"
        >
          {t.promo.cta}
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors text-sm leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

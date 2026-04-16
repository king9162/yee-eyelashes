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
    <div className="bg-neutral-900 text-white text-center py-2 px-4 text-[10px] tracking-[0.15em] relative">
      <span className="text-neutral-300">{t.promo.text}</span>{" "}
      <Link
        href={`/${lang}/booking`}
        className="text-[#C9A84C] hover:text-[#DFC078] transition-colors ml-2 underline underline-offset-2"
      >
        {t.promo.cta}
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors text-sm leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Lang, getTranslations } from "@/i18n";
import { faqs } from "@/data/faq";
import SectionTitle from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";

type Props = { lang: Lang };

export default function FAQSection({ lang }: Props) {
  const t = getTranslations(lang);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-32 bg-white">
      <div className="max-w-[780px] mx-auto px-6 sm:px-10 lg:px-16">

        <SectionTitle
          heading={t.faq.heading}
          subheading={t.faq.subheading}
          eyebrow={lang === "zh" ? "常見問題" : "Questions"}
        />

        <div className="divide-y divide-neutral-100">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="py-7">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-start justify-between text-left gap-8 group"
                >
                  <span
                    className={cn(
                      "text-[13.5px] leading-snug tracking-[0.01em] transition-colors duration-200",
                      isOpen ? "text-[#C9A84C]" : "text-neutral-700 group-hover:text-[#1C1C1C]"
                    )}
                  >
                    {lang === "zh" ? faq.questionZh : faq.questionEn}
                  </span>
                  <span
                    className={cn(
                      "text-[#C9A84C] text-[1.1rem] font-extralight flex-shrink-0 leading-none transition-transform duration-300 mt-0.5",
                      isOpen ? "rotate-45" : ""
                    )}
                  >
                    +
                  </span>
                </button>

                <div className={cn("overflow-hidden transition-all duration-350", isOpen ? "max-h-64 mt-5" : "max-h-0")}>
                  <p className="text-[13px] text-neutral-400 leading-[1.9] tracking-[0.02em]">
                    {lang === "zh" ? faq.answerZh : faq.answerEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

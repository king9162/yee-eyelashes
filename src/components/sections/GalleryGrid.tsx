"use client";

import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function GalleryGrid({ lang }: Props) {
  const zh = lang === "zh";

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-14 pb-32">
      <div className="flex flex-col items-center justify-center gap-6 py-32 bg-[#EDEAE3]">
        <div className="w-px h-12 bg-[#C9A84C]/30" />
        <p className="text-[9px] uppercase tracking-[0.6em] text-[#C9A84C]">
          {zh ? "作品集即將推出" : "Portfolio Coming Soon"}
        </p>
        <p className="text-[13px] text-neutral-400 tracking-[0.02em] text-center max-w-sm leading-[1.9]">
          {zh
            ? "我們正在整理最新的作品，敬請期待。"
            : "We're curating our latest work. Check back soon."}
        </p>
        <div className="w-px h-12 bg-[#C9A84C]/30" />
      </div>
    </div>
  );
}

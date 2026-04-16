"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { galleryItems, galleryCategories, type GalleryCategory } from "@/data/gallery";
import { isValidLang, getTranslations, type Lang } from "@/i18n";

export default function GalleryGrid() {
  const params = useParams();
  const rawLang = params?.lang as string;
  const lang: Lang = isValidLang(rawLang) ? rawLang : "en";
  const [activeFilter, setActiveFilter] = useState<GalleryCategory>("all");

  const filtered = activeFilter === "all"
    ? galleryItems
    : galleryItems.filter((g) => g.category === activeFilter);

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-14">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-12">
        {galleryCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`text-[9.5px] uppercase tracking-[0.28em] px-5 py-2.5 transition-all duration-250 ${
              activeFilter === cat.id
                ? "bg-[#1C1C1C] text-white"
                : "text-neutral-400 hover:text-[#1C1C1C] border border-neutral-150 hover:border-neutral-400"
            }`}
          >
            {lang === "zh" ? cat.labelZh : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {filtered.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden group">
            <Image
              src={item.src}
              alt={lang === "zh" ? item.altZh : item.altEn}
              fill
              className="object-cover transition-transform duration-600 group-hover:scale-[1.05]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-[#1C1C1C]/0 group-hover:bg-[#1C1C1C]/20 transition-all duration-400" />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-neutral-300 text-sm tracking-wide">
          {lang === "zh" ? "暫無圖片" : "No images found"}
        </div>
      )}
    </div>
  );
}

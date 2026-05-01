"use client";

import Image from "next/image";
import { useState } from "react";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

type Photo = { src: string; alt: string; altZh: string };

const STUDIO_PHOTOS: Photo[] = [
  { src: "/images/19211.JPG", alt: "Yee Eyelashes treatment room",      altZh: "療程室" },
  { src: "/images/19212.JPG", alt: "Yee Eyelashes studio & branding",   altZh: "店內實拍" },
  { src: "/images/19214.JPG", alt: "Yee Eyelashes gift bags",           altZh: "品牌禮袋" },
  { src: "/images/19215.JPG", alt: "Yee Eyelashes branding & tools",    altZh: "品牌與工具" },
  { src: "/images/19209.JPG", alt: "Yee Eyelashes branded cups",        altZh: "品牌杯具" },
];

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white text-3xl font-light transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1200}
          height={900}
          className="w-full h-auto max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
}

export default function GalleryGrid({ lang }: Props) {
  const zh = lang === "zh";
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  // Duplicate for seamless loop
  const looped = [...STUDIO_PHOTOS, ...STUDIO_PHOTOS];

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-14 pb-32">

      {/* Studio strip */}
      <div className="mb-16">
        <div className="flex items-center gap-5 mb-8">
          <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] flex-shrink-0">
            {zh ? "店內實拍" : "Our Studio"}
          </p>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Scrolling strip */}
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-marquee" style={{ width: "max-content" }}>
            {looped.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(photo)}
                className="group relative flex-shrink-0 overflow-hidden bg-neutral-50 w-[80vw] h-[52vw] sm:w-[420px] sm:h-[260px]"
              >
                <Image
                  src={photo.src}
                  alt={zh ? photo.altZh : photo.alt}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="420px"
                />
                <div className="absolute inset-0 bg-[#1C1C1C]/0 group-hover:bg-[#1C1C1C]/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white/0 group-hover:text-white/80 text-[10px] uppercase tracking-[0.3em] transition-all duration-300">
                    {zh ? "查看" : "View"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Lightbox */}
      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

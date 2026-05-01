"use client";

import Image from "next/image";
import { useState } from "react";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

type Photo = { src: string; alt: string; altZh: string };

const STUDIO_PHOTOS: Photo[] = [
  { src: "/images/studio-beds.jpg",      alt: "Yee Eyelashes treatment room",    altZh: "療程室" },
  { src: "/images/studio-treatment.jpg", alt: "Lash extension in progress",      altZh: "嫁接睫毛中" },
  { src: "/images/studio-room.jpg",      alt: "Yee Eyelashes studio interior",   altZh: "店內實拍" },
  { src: "/images/studio-decor.jpg",     alt: "Yee Eyelashes studio decor",      altZh: "店內裝飾" },
  { src: "/images/studio-sofa.jpg",      alt: "Yee Eyelashes lounge area",       altZh: "休息區" },
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
      <div className="relative max-w-5xl max-h-[88vh] w-full" onClick={e => e.stopPropagation()}>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1400}
          height={1000}
          className="w-full h-auto max-h-[88vh] object-contain"
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
          <div className="flex gap-5 animate-marquee" style={{ width: "max-content" }}>
            {looped.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(photo)}
                className="group relative flex-shrink-0 overflow-hidden bg-[#F5F3EF] w-[85vw] h-[57vw] sm:w-[500px] sm:h-[340px]"
              >
                <Image
                  src={photo.src}
                  alt={zh ? photo.altZh : photo.alt}
                  fill
                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="500px"
                />
                <div className="absolute inset-0 bg-[#1C1C1C]/0 group-hover:bg-[#1C1C1C]/15 transition-all duration-300 flex items-center justify-center">
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

"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };
type Photo = { src: string; alt: string; altZh: string };

const REELS = [
  "/videos/reel-5.mp4",
  "/videos/reel-4.mp4",
  "/videos/reel-2.mp4",
  "/videos/709_raw.mp4",
  "/videos/710_raw.mp4",
  "/videos/713_raw.mp4",
  "/videos/reel-1.mp4",
  "/videos/reel-3.mp4",
  "/videos/reel-6.mp4",
];

const STUDIO_PHOTOS: Photo[] = [
  { src: "/images/6-9-2026/IMG_3472.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_3829.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5028.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5029.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5066.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5259.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5377.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5841.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5842.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5844.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_5865.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_6817.jpg",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/708.jpg",                                   alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/711.jpg",                                   alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/87786cb1758679dcacd51fbf83d28e0c.jpg",      alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/IMG_2716.JPG",                              alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/A0E2073E-34D0-4C69-959F-6F9E8AD90EB4.png", alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/AE41D708-96FB-493F-8647-56AB4DC29C55.png", alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
  { src: "/images/6-9-2026/B0E2C97D-0266-4056-B75B-97E4CD437216.png", alt: "Lash extensions by Yee Eyelashes", altZh: "Yee Eyelashes 睫毛嫁接作品" },
];

function VideoLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white text-3xl font-light transition-colors" onClick={onClose} aria-label="Close">×</button>
      <div className="relative max-h-[90vh] w-auto" style={{ aspectRatio: "9/16" }} onClick={e => e.stopPropagation()}>
        <video src={src} autoPlay muted loop playsInline controls className="h-[90vh] w-auto max-w-[90vw] object-contain" />
      </div>
    </div>
  );
}

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white text-3xl font-light transition-colors" onClick={onClose} aria-label="Close">×</button>
      <div className="relative max-w-5xl max-h-[88vh] w-full" onClick={e => e.stopPropagation()}>
        <Image src={photo.src} alt={photo.alt} width={1400} height={1000} className="w-full h-auto max-h-[88vh] object-contain" />
      </div>
    </div>
  );
}

export default function GalleryGrid({ lang }: Props) {
  const zh = lang === "zh";
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [videoLightbox, setVideoLightbox] = useState<string | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isTouch, setIsTouch] = useState(false);

  // Strip scroll state
  const stripRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const touch = window.matchMedia("(hover: none)").matches;
    setIsTouch(touch);
    if (touch) {
      videoRefs.current.forEach(v => v?.play().catch(() => {}));
    }
  }, []);

  // Auto-scroll the strip via requestAnimationFrame
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    let rafId: number;
    let last = 0;
    const speed = 0.1; // px/ms

    function tick(now: number) {
      const dt = last ? now - last : 0;
      last = now;
      if (!pausedRef.current && el) {
        el.scrollLeft += speed * dt;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const scrollStrip = useCallback((dir: "left" | "right") => {
    const el = stripRef.current;
    if (!el) return;
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    const amount = window.innerWidth < 640 ? window.innerWidth * 0.8 : 460;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    resumeTimer.current = setTimeout(() => { pausedRef.current = false; }, 4000);
  }, []);

  const looped = [...STUDIO_PHOTOS, ...STUDIO_PHOTOS];

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-10 lg:px-16 pt-10 sm:pt-14 pb-24 sm:pb-32">

      {/* Our Work header */}
      <div className="flex items-center gap-5 mb-8">
        <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] flex-shrink-0">
          {zh ? "最新作品" : "Our Work"}
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      {/* Photo strip with arrows */}
      <div
        className="relative mb-10"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => {
          if (resumeTimer.current) clearTimeout(resumeTimer.current);
          pausedRef.current = false;
        }}
      >
        {/* Left arrow */}
        <button
          onClick={() => scrollStrip("left")}
          aria-label="Previous"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-black/25 hover:bg-black/50 text-white transition-all duration-200 rounded-full"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scrollStrip("right")}
          aria-label="Next"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-black/25 hover:bg-black/50 text-white transition-all duration-200 rounded-full"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Scrollable strip (no scrollbar) */}
        <div
          ref={stripRef}
          className="flex gap-5"
          style={{ overflowX: "scroll", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {looped.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightbox(photo)}
              className="group relative flex-shrink-0 overflow-hidden bg-[#F5F3EF] w-[75vw] h-[100vw] sm:w-[420px] sm:h-[560px]"
            >
              <Image
                src={photo.src}
                alt={zh ? photo.altZh : photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="420px"
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

      {/* Video grid */}
      <div className="mb-16">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          {REELS.map((src, i) => (
            <div
              key={i}
              className="relative overflow-hidden bg-neutral-100 cursor-pointer"
              style={{ aspectRatio: "9/16" }}
              onMouseEnter={() => !isTouch && videoRefs.current[i]?.play()}
              onMouseLeave={() => {
                if (!isTouch) {
                  const v = videoRefs.current[i];
                  if (v) { v.pause(); v.currentTime = 0; }
                }
              }}
              onClick={() => setVideoLightbox(src)}
            >
              <video
                ref={el => { videoRefs.current[i] = el; }}
                src={src}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
      {videoLightbox && <VideoLightbox src={videoLightbox} onClose={() => setVideoLightbox(null)} />}
    </div>
  );
}

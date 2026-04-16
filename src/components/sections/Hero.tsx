"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Lang, getTranslations } from "@/i18n";

/* ─────────────────────────────────────────
   Slide data  (replace images with real ones)
───────────────────────────────────────── */
const slides = [
  {
    id: "s1",
    src: "https://images.pexels.com/photos/5128220/pexels-photo-5128220.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1&fit=crop",
    eyebrow: {
      en: "Long Island · New York",
      zh: "長島 · 紐約",
    },
    headline: {
      en: ["Elevate", "Your Look"],
      zh: ["讓美麗", "更升華"],
    },
    showCta: true,
  },
  {
    id: "s2",
    src: "https://images.pexels.com/photos/1066158/pexels-photo-1066158.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1&fit=crop",
    eyebrow: {
      en: "Classic · Hybrid · Volume",
      zh: "經典 · 混合 · 豐盈",
    },
    headline: {
      en: ["Natural", "Beauty"],
      zh: ["自然", "之美"],
    },
    showCta: false,
  },
  {
    id: "s3",
    src: "https://images.pexels.com/photos/4572091/pexels-photo-4572091.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1&fit=crop",
    eyebrow: {
      en: "Premium Lash Extensions",
      zh: "頂級睫毛嫁接",
    },
    headline: {
      en: ["Bold", "Confidence"],
      zh: ["大膽", "自信"],
    },
    showCta: false,
  },
  {
    id: "s4",
    src: "https://images.pexels.com/photos/3657418/pexels-photo-3657418.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1&fit=crop",
    eyebrow: {
      en: "Book Your Appointment",
      zh: "立即預約",
    },
    headline: {
      en: ["Your Perfect", "Set Awaits"],
      zh: ["完美效果", "等待您"],
    },
    showCta: true,
  },
];

/* ─────────────────────────────────────────
   Arrow SVGs
───────────────────────────────────────── */
function ArrowLeft() {
  return (
    <svg
      width="20" height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="20" height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
type Props = { lang: Lang };

export default function Hero({ lang }: Props) {
  const t = getTranslations(lang);

  /* Autoplay plugin — stable ref */
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 5800,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 42 },
    [autoplayPlugin.current]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const total = slides.length;

  /* Track selected slide */
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo   = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section className="relative w-full overflow-hidden bg-[#F5F1E9]"
      style={{ height: "clamp(500px, 68vh, 800px)" }}
    >

      {/* ══════════════════════════════
          Embla viewport
      ══════════════════════════════ */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y select-none">
          {slides.map((slide, i) => {
            const lines = lang === "zh" ? slide.headline.zh : slide.headline.en;
            const eyebrow = lang === "zh" ? slide.eyebrow.zh : slide.eyebrow.en;

            return (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0 relative h-full"
              >
                {/* Image */}
                <Image
                  src={slide.src}
                  alt={lines.join(" ")}
                  fill
                  className="object-cover object-center"
                  priority={i === 0}
                  sizes="100vw"
                  draggable={false}
                />

                {/* Gradient — bottom-heavy, lets image breathe at top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Slide content — bottom-left */}
                <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-16 xl:px-20 pb-16 lg:pb-20">
                  <div className="max-w-[1400px] mx-auto flex items-end justify-between gap-8">

                    {/* Text */}
                    <div>
                      {/* Eyebrow */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-8 h-px bg-[#C9A84C]" />
                        <span className="text-[#C9A84C] text-[9px] uppercase tracking-[0.55em]">
                          {eyebrow}
                        </span>
                      </div>

                      {/* Headline */}
                      <h1
                        className="font-light text-white leading-[0.92] tracking-[-0.02em]"
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "clamp(2.6rem, 5vw, 5.5rem)",
                        }}
                      >
                        {lines.map((line, li) => (
                          <span key={li} className="block">{line}</span>
                        ))}
                      </h1>

                      {/* CTA — only on select slides */}
                      {slide.showCta && (
                        <div className="mt-9">
                          <Link
                            href={`/${lang}/booking`}
                            className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-white"
                          >
                            <span className="border-b border-white/40 pb-px group-hover:border-[#C9A84C] group-hover:text-[#C9A84C] transition-all duration-300">
                              {t.hero.cta_primary}
                            </span>
                            <span className="text-[#C9A84C] transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Slide counter — desktop only */}
                    <div className="hidden md:flex flex-col items-center gap-1 flex-shrink-0 pb-1">
                      <span
                        className="text-white text-[1.4rem] font-light leading-none"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {String(selectedIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="w-px h-5 bg-white/20" />
                      <span className="text-white/35 text-[9px] tracking-[0.1em]">
                        {String(total).padStart(2, "0")}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════
          Navigation arrows
      ══════════════════════════════ */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className={cn(
          "absolute left-4 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20",
          "w-11 h-11 flex items-center justify-center",
          "text-white/60 hover:text-white",
          "border border-white/20 hover:border-white/50",
          "bg-black/10 hover:bg-black/20",
          "transition-all duration-300 backdrop-blur-[2px]"
        )}
      >
        <ArrowLeft />
      </button>

      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className={cn(
          "absolute right-4 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20",
          "w-11 h-11 flex items-center justify-center",
          "text-white/60 hover:text-white",
          "border border-white/20 hover:border-white/50",
          "bg-black/10 hover:bg-black/20",
          "transition-all duration-300 backdrop-blur-[2px]"
        )}
      >
        <ArrowRight />
      </button>

      {/* ══════════════════════════════
          Progress bars — bottom center
      ══════════════════════════════ */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
        role="tablist"
        aria-label="Slide navigation"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === selectedIndex}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-px transition-all duration-500 ease-out",
              i === selectedIndex
                ? "w-10 bg-[#C9A84C]"
                : "w-5 bg-white/35 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* ══════════════════════════════
          Scroll hint — desktop only
      ══════════════════════════════ */}
      <div className="absolute right-6 bottom-6 z-20 hidden lg:flex flex-col items-center gap-2">
        <span className="text-white/25 text-[8px] uppercase tracking-[0.35em] rotate-90 origin-center mb-2">
          scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-white/25 to-transparent" />
      </div>

    </section>
  );
}

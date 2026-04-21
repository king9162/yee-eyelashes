"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const slides = [
  { src: "/images/hero-1.jpg", alt: "Yee Eyelashes treatment room" },
  { src: "/images/hero-2.jpg", alt: "Yee Eyelashes lounge area" },
  { src: "/images/hero-3.jpg", alt: "Yee Eyelashes studio detail" },
  { src: "/images/hero-4.jpg", alt: "Yee Eyelashes studio decor" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length), []);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <>
      {/* Images */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#1C1C1C]/72" />

      {/* Left arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === current ? "#C9A84C" : "rgba(255,255,255,0.3)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { src: "/images/hero-1.jpg", alt: "Yee Eyelashes treatment room" },
  { src: "/images/hero-2.jpg", alt: "Yee Eyelashes lounge area" },
  { src: "/images/hero-3.jpg", alt: "Yee Eyelashes studio detail" },
  { src: "/images/hero-4.jpg", alt: "Yee Eyelashes studio decor" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

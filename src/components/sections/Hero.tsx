import Link from "next/link";
import { Lang, getTranslations } from "@/i18n";
import HeroSlider from "@/components/ui/HeroSlider";

type Props = { lang: Lang };

export default function Hero({ lang }: Props) {
  const t = getTranslations(lang);
  const zh = lang === "zh";

  return (
    <section
      className="relative w-full bg-[#1C1C1C] flex items-end overflow-hidden"
      style={{ height: "clamp(580px, 82vh, 920px)" }}
    >
      {/* Auto-sliding background photos */}
      <HeroSlider />

      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#C9A84C]/20" />
      <div className="absolute top-6 left-6 sm:left-10 lg:left-16 xl:left-20 w-px h-16 bg-[#C9A84C]/20" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-20 pb-16 lg:pb-20">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between gap-8">

          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-[9px] uppercase tracking-[0.55em]">
                {zh ? "長島 · 紐約" : "Long Island · New York"}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-light text-white leading-[0.92] tracking-[-0.02em] mb-9"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.6rem, 5vw, 5.5rem)",
              }}
            >
              <span className="block">{zh ? "讓美麗" : "Elevate"}</span>
              <span className="block">{zh ? "更升華" : "Your Look"}</span>
            </h1>

            {/* CTA */}
            <Link
              href={`/${lang}/booking`}
              className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-white"
            >
              <span className="border-b border-white/40 pb-px group-hover:border-[#C9A84C] group-hover:text-[#C9A84C] transition-all duration-300">
                {t.hero.cta_primary}
              </span>
              <span className="text-[#C9A84C] transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Right: tagline — desktop only */}
          <p
            className="hidden lg:block text-white/20 text-[13px] tracking-[0.08em] leading-[1.9] text-right max-w-[200px] flex-shrink-0 pb-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {zh
              ? "每一副睫毛都是\n量身打造的藝術"
              : "Every set is a\nbespoke work of art"}
          </p>

        </div>
      </div>

      {/* Bottom gold rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#C9A84C]/15" />
    </section>
  );
}

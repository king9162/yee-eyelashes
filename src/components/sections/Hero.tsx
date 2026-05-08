import Link from "next/link";
import HeroSlider from "@/components/ui/HeroSlider";
import { type Lang, getTranslations } from "@/i18n";

type Props = { lang: Lang };

export default function Hero({ lang }: Props) {
  const t = getTranslations(lang);

  return (
    <section className="relative w-full overflow-hidden h-[80vw] md:h-[56vw] md:max-h-[820px]">
      <HeroSlider />

      {/* Mobile CTA overlay — visible on small screens only */}
      <div className="md:hidden absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/65 via-black/20 to-transparent">
        <div className="px-6 pb-8">
          <p className="text-[8.5px] uppercase tracking-[0.45em] text-[#C9A84C] mb-3">
            {t.hero.tagline}
          </p>
          <div className="flex gap-3">
            <Link
              href="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9.5px] uppercase tracking-[0.3em] text-[#1C1C1C] bg-[#C9A84C] px-6 py-3 flex items-center gap-2"
            >
              {t.nav.booking} <span>→</span>
            </Link>
            <Link
              href={`/${lang}/services`}
              className="text-[9.5px] uppercase tracking-[0.3em] text-white border border-white/50 px-6 py-3"
            >
              {lang === "zh" ? "服務項目" : "Services"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

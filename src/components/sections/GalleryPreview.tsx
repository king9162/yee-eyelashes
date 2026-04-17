import Link from "next/link";
import { Lang, getTranslations } from "@/i18n";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = { lang: Lang };

export default function GalleryPreview({ lang }: Props) {
  const t = getTranslations(lang);
  const zh = lang === "zh";

  return (
    <section className="py-32 bg-[#F8F5EF]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

        <SectionTitle
          heading={t.gallery_preview.heading}
          subheading={t.gallery_preview.subheading}
          eyebrow={zh ? "作品集" : "Portfolio"}
        />

        {/* Coming soon */}
        <div className="flex flex-col items-center justify-center gap-6 py-24 mb-14 bg-[#EDEAE3]">
          <div className="w-px h-12 bg-[#C9A84C]/30" />
          <p className="text-[9px] uppercase tracking-[0.6em] text-[#C9A84C]">
            {zh ? "作品集即將推出" : "Portfolio Coming Soon"}
          </p>
          <p className="text-[13px] text-neutral-400 tracking-[0.02em] text-center max-w-sm leading-[1.9]">
            {zh
              ? "我們正在整理最新的作品，敬請期待。"
              : "We're curating our latest work. Stay tuned."}
          </p>
          <div className="w-px h-12 bg-[#C9A84C]/30" />
        </div>

        {/* CTA */}
        <div className="flex items-center gap-6">
          <div className="flex-1 h-px bg-neutral-300/40" />
          <Link
            href={`/${lang}/gallery`}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-[#C9A84C] transition-colors duration-300 flex-shrink-0"
          >
            {t.gallery_preview.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#C9A84C]">→</span>
          </Link>
          <div className="flex-1 h-px bg-neutral-300/40" />
        </div>

      </div>
    </section>
  );
}

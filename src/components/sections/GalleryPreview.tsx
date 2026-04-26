import Image from "next/image";
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

        {/* Brand showcase image */}
        <div className="relative max-w-2xl mx-auto mb-14 overflow-hidden">
          <Image
            src="/images/brand-showcase.png"
            alt="Yee Eyelashes — Define Your Beauty"
            width={1200}
            height={1200}
            className="w-full h-auto object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
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

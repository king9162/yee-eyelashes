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

        {/* Coming soon grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-14">

          {/* Large left tile — row-span-2 */}
          <div className="row-span-2 relative overflow-hidden bg-[#EDEAE3] min-h-[340px] flex flex-col items-center justify-center gap-5">
            <div className="w-px h-10 bg-[#C9A84C]/30" />
            <p className="text-[9px] uppercase tracking-[0.55em] text-[#C9A84C]">
              {zh ? "即將推出" : "Coming Soon"}
            </p>
            <div className="w-px h-10 bg-[#C9A84C]/30" />
          </div>

          {/* 4 smaller tiles */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden bg-[#E8E4DC] flex items-center justify-center"
            >
              <p className="text-[8px] uppercase tracking-[0.45em] text-[#C9A84C]/50">
                {zh ? "即將推出" : "Coming Soon"}
              </p>
            </div>
          ))}
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

import Link from "next/link";
import Image from "next/image";
import { Lang, getTranslations } from "@/i18n";
import { galleryItems } from "@/data/gallery";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = { lang: Lang };

export default function GalleryPreview({ lang }: Props) {
  const t = getTranslations(lang);
  const featured = galleryItems.filter((g) => g.featured).slice(0, 5);

  return (
    <section className="py-32 bg-[#F8F5EF]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

        <SectionTitle
          heading={t.gallery_preview.heading}
          subheading={t.gallery_preview.subheading}
          eyebrow={lang === "zh" ? "作品集" : "Portfolio"}
        />

        {/* Asymmetric editorial grid: 1 tall left + 2×2 right */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-14">
          {/* Large featured tile */}
          <div className="row-span-2 relative overflow-hidden group">
            <div className="relative w-full h-full min-h-[340px]">
              <Image
                src={featured[0]?.src ?? "https://images.pexels.com/photos/21412169/pexels-photo-21412169.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&dpr=1&fit=crop"}
                alt={lang === "zh" ? featured[0]?.altZh : featured[0]?.altEn}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[#1C1C1C]/0 group-hover:bg-[#1C1C1C]/15 transition-colors duration-500" />
            </div>
          </div>

          {/* 4 smaller tiles */}
          {featured.slice(1, 5).map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden group">
              <Image
                src={item.src}
                alt={lang === "zh" ? item.altZh : item.altEn}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[#1C1C1C]/0 group-hover:bg-[#1C1C1C]/15 transition-colors duration-500" />
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

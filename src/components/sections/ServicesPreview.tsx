import Link from "next/link";
import { Lang, getTranslations } from "@/i18n";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = { lang: Lang };

const categories = [
  {
    n: "01",
    nameEn: "Eyelash Extensions",
    nameZh: "睫毛嫁接",
    descEn: "Precision-crafted classic, hybrid, and volume sets, each designed around your eye shape and lifestyle. From understated elegance to bold drama, every set is uniquely yours.",
    descZh: "精準打造的經典、混合、豐盈及超豐盈款式——每一套都根據您的眼形與生活方式量身設計。從低調優雅到大膽奪目，每一副都獨一無二。",
    fromEn: "From $60",
    fromZh: "從 $60 起",
    durationEn: "50 min – 1.5 hrs",
    durationZh: "50 分鐘 – 1.5 小時",
  },
  {
    n: "02",
    nameEn: "Lash Lift & Tint",
    nameZh: "睫毛燙翹與染色",
    descEn: "Give your natural lashes a long-lasting curl and lift — no extensions needed. Paired with a professional tint for deeper color and definition. Results last 6–8 weeks with zero daily maintenance.",
    descZh: "無需嫁接，讓天然睫毛持久捲翹提升。搭配專業染色增添深邃色澤與輪廓，效果持續 6-8 週，完全不需日常護理。",
    fromEn: "From $88",
    fromZh: "從 $88 起",
    durationEn: "~1 hr",
    durationZh: "約 1 小時",
  },
  {
    n: "03",
    nameEn: "Refills & Care",
    nameZh: "補睫與護理",
    descEn: "Keep your lashes looking freshly done between full sets. Our 1, 2, and 3-week refill schedules are tailored to your natural lash cycle, so you never have to compromise on fullness.",
    descZh: "在全套嫁接之間保持剛做完的美感。我們的 1、2、3 週補睫方案依您的天然睫毛週期量身安排——讓您的豐盈感從不打折。",
    fromEn: "From $40",
    fromZh: "從 $40 起",
    durationEn: "~1 hr",
    durationZh: "約 1 小時",
  },
];

export default function ServicesPreview({ lang }: Props) {
  const t = getTranslations(lang);

  return (
    <section className="py-16 md:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16">

        <SectionTitle
          heading={t.services_preview.heading}
          subheading={t.services_preview.subheading}
          eyebrow={lang === "zh" ? "服務" : "What We Offer"}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 md:mb-16">
          {categories.map((cat) => (
            <Link
              key={cat.n}
              href={`/${lang}/services`}
              className="group relative bg-[#FAFAF8] hover:bg-[#F5F0E6] transition-colors duration-500 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col"
            >
              {/* Index */}
              <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-300 mb-4 mt-1">
                {cat.n}
              </p>

              {/* Name */}
              <h3
                className="text-[1.25rem] sm:text-[1.65rem] font-light leading-tight text-[#1C1C1C] mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {lang === "zh" ? cat.nameZh : cat.nameEn}
              </h3>

              {/* Description */}
              <p className="text-[13px] leading-[1.8] text-neutral-400 tracking-[0.01em] flex-1">
                {lang === "zh" ? cat.descZh : cat.descEn}
              </p>

              {/* Price / Duration row */}
              <div className="flex items-end justify-between pt-4 mt-6 border-t border-neutral-200/60">
                <span
                  className="text-[1.4rem] sm:text-[1.6rem] font-light text-[#C9A84C] leading-none"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {lang === "zh" ? cat.fromZh : cat.fromEn}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-300 pb-1">
                  {lang === "zh" ? cat.durationZh : cat.durationEn}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-6">
          <div className="flex-1 h-px bg-neutral-100" />
          <Link
            href={`/${lang}/services`}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-[#C9A84C] transition-colors duration-300 flex-shrink-0"
          >
            {t.services_preview.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#C9A84C]">→</span>
          </Link>
          <div className="flex-1 h-px bg-neutral-100" />
        </div>

      </div>
    </section>
  );
}

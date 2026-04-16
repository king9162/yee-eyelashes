import Image from "next/image";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

const row1 = [
  { en: "No water or steam\nfor 24 hours",     zh: "24 小時內\n避免水氣蒸氣" },
  { en: "Do not pick or\npull lashes",          zh: "請勿拉扯\n或摳睫毛" },
  { en: "No mascara",                           zh: "避免使用\n睫毛膏" },
  { en: "No lash curler",                       zh: "請勿使用\n睫毛夾" },
  { en: "Use oil-free\nproducts",               zh: "使用無油\n清潔產品" },
];

const row2 = [
  { en: "Gently wash your\nlashes from day 1", zh: "第一天起\n輕柔清潔睫毛" },
  { en: "Sleep on your\nback or side",          zh: "仰臥或\n側臥入睡" },
  { en: "Brush and clean\nyour lashes daily",   zh: "每日梳理\n並清潔睫毛" },
  { en: "Schedule your\nnext appointment",      zh: "提前預約\n下次補睫" },
  { en: "Remove by\nprofessionals",             zh: "交由專業人員\n卸除睫毛" },
];

export default function AftercareTips({ lang }: Props) {
  return (
    <section className="bg-white py-10 md:py-14 border-t border-neutral-100">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 lg:px-16">

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="w-6 h-px bg-[#C9A84C]" />
            <span className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]">
              {lang === "zh" ? "睫毛護理" : "Aftercare"}
            </span>
            <div className="w-6 h-px bg-[#C9A84C]" />
          </div>
          <h2
            className="font-light text-[#1C1C1C] leading-tight tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)" }}
          >
            {lang === "zh" ? "嫁接後護理指南" : "How to Care for Your Lashes"}
          </h2>
        </div>

        <div className="max-w-[820px] mx-auto">

          {/* ── Row 1: top half of image + labels ── */}
          <div
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: "2426 / 493" }}
          >
            <Image
              src="/images/aftercare-icons.png"
              alt="Lash aftercare — no water, no picking, no mascara, no curler, oil-free products"
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 820px"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 mt-3 mb-10">
            {row1.map((item, i) => (
              <p
                key={i}
                className="text-center text-[8px] sm:text-[10px] md:text-[13px] text-[#1C1C1C] leading-[1.6] tracking-[0.01em] whitespace-pre-line"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {lang === "zh" ? item.zh : item.en}
              </p>
            ))}
          </div>

          {/* ── Row 2: bottom half of image + labels ── */}
          <div
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: "2426 / 493" }}
          >
            <Image
              src="/images/aftercare-icons.png"
              alt="Lash aftercare — gentle wash, sleep position, brush daily, schedule, remove by professionals"
              fill
              className="object-cover object-bottom"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 820px"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 mt-3">
            {row2.map((item, i) => (
              <p
                key={i}
                className="text-center text-[8px] sm:text-[10px] md:text-[13px] text-[#1C1C1C] leading-[1.6] tracking-[0.01em] whitespace-pre-line"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {lang === "zh" ? item.zh : item.en}
              </p>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

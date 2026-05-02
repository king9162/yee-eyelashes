"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

// ─── Photo mosaic ────────────────────────────────────────────────
// Replace these with actual lash-work photos when available
const MOSAIC: { src: string; alt: string }[] = [
  { src: "/images/gallery-1.jpg",        alt: "Lash extensions" },
  { src: "/images/studio-treatment.jpg", alt: "Lash treatment in progress" },
  { src: "/images/gallery-2.jpg",        alt: "Lash close-up" },
  { src: "/images/studio-beds.jpg",      alt: "Yee Eyelashes treatment room" },
  { src: "/images/gallery-3.jpg",        alt: "Lash extensions close-up" },
  { src: "/images/studio-decor.jpg",     alt: "Yee Eyelashes studio" },
];

// ─── Price data ──────────────────────────────────────────────────
const PCS = [60, 80, 100, 120, 140, 180] as const;

const MS: Record<number, [number,string,number,string,number,string,number,string,number,string]> = {
  60:  [60,"1hr",       30,"30min", 40,"40min", 50,"50min",    150,"1hr"],
  80:  [80,"1hr 15min", 40,"35min", 50,"45min", 70,"1hr",      170,"1hr 15min"],
  100: [100,"1hr 30min",50,"40min", 60,"50min", 80,"1hr 5min", 220,"1hr 30min"],
  120: [120,"1hr 45min",60,"45min", 70,"55min", 90,"1hr 10min",260,"1hr 45min"],
  140: [130,"2hr",      70,"50min", 80,"1hr",  100,"1hr 15min",280,"2hr"],
  180: [160,"2hr 15min",80,"55min", 90,"1hr 5min",110,"1hr 20min",340,"2hr 15min"],
};
const PC: Record<number, [number,string,number,string,number,string,number,string,number,string]> = {
  60:  [80,"1hr",        50,"30min", 60,"40min",  70,"50min",    180,"1hr"],
  80:  [100,"1hr 15min", 60,"35min", 70,"45min",  90,"1hr",      200,"1hr 15min"],
  100: [120,"1hr 30min", 70,"40min", 80,"50min", 100,"1hr 5min", 250,"1hr 30min"],
  120: [140,"1hr 45min", 80,"45min", 90,"55min", 110,"1hr 10min",290,"1hr 45min"],
  140: [150,"2hr",       90,"50min",100,"1hr",   120,"1hr 15min",310,"2hr"],
  180: [180,"2hr 15min",100,"55min",110,"1hr 5min",130,"1hr 20min",370,"2hr 15min"],
};

// Descriptions for each pcs count (shown under New Set only)
const NEW_SET_DESC: Record<number, { en: string; zh: string }> = {
  60:  { en: "Super Natural look — 60pcs on each eye for a barely-there, everyday enhancement.",
         zh: "超自然裸妝感，每眼 60 根，輕盈提升，彷彿天生美麗。" },
  80:  { en: "Natural, barely-there enhancement. Perfect for a soft, subtle look like naturally fuller lashes.",
         zh: "最自然的裸妝提升，適合追求低調、柔和感，彷彿天生豐盈的客人。" },
  100: { en: "A soft, balanced look between natural and defined — like perfectly applied mascara.",
         zh: "介於自然與精緻之間的平衡美感，宛如完美刷上睫毛膏的效果。" },
  120: { en: "Effortless beauty without daily mascara. A naturally enhanced, refined finish.",
         zh: "免去睫毛膏煩惱，打造自然捲翹、精緻完美的妝感。" },
  140: { en: "Hybrid style — a fluffier, more voluminous look with enhanced depth and layering.",
         zh: "混合嫁接款，層次更豐富、蓬鬆感更強，立體感全面提升。" },
  180: { en: "Bold, glamorous lashes with dramatic density. Customized by your lash artist for a stunning finish.",
         zh: "濃郁魅力睫毛，密度十足，由技師量身設計，打造驚豔妝效。" },
};

type LashServiceType = {
  name: string; nameZh: string;
  rows: { pcs: number; price: number; dur: string }[];
  showDesc?: boolean;
};

function buildLashTypes(data: typeof MS): LashServiceType[] {
  return [
    { name: "New Set",         nameZh: "全新嫁接", showDesc: true, rows: PCS.map(p => ({ pcs: p, price: data[p][0], dur: data[p][1] })) },
    { name: "1 Week Refill",   nameZh: "一週補睫", rows: PCS.map(p => ({ pcs: p, price: data[p][2], dur: data[p][3] })) },
    { name: "2 Week Refill",   nameZh: "兩週補睫", rows: PCS.map(p => ({ pcs: p, price: data[p][4], dur: data[p][5] })) },
    { name: "3 Week Refill",   nameZh: "三週補睫", rows: PCS.map(p => ({ pcs: p, price: data[p][6], dur: data[p][7] })) },
    { name: "3 Times Package", nameZh: "三次套裝", rows: PCS.map(p => ({ pcs: p, price: data[p][8], dur: data[p][9] })) },
  ];
}

type FlatItem = { name: string; nameZh: string; price?: number; duration?: string; note?: string; noteZh?: string; isHeader?: boolean };

const FILLS_PMU: FlatItem[] = [
  { name: "Refills",              nameZh: "補睫",               isHeader: true },
  { name: "1 Week Refill",        nameZh: "一週補睫",   price: 40,  duration: "1hr",       note: "4–7 days",   noteZh: "4–7 天後" },
  { name: "2 Week Refill",        nameZh: "兩週補睫",   price: 50,  duration: "1hr",       note: "8–14 days",  noteZh: "8–14 天後" },
  { name: "3 Week Refill",        nameZh: "三週補睫",   price: 70,  duration: "1hr",       note: "15–21 days", noteZh: "15–21 天後" },
  { name: "Eyelash Lift & Other", nameZh: "睫毛燙翹與其他",       isHeader: true },
  { name: "Eyelash Lift",         nameZh: "睫毛燙翹",   price: 79,  duration: "45min" },
  { name: "Eyelash Tinting",      nameZh: "睫毛染色",   price: 20,  duration: "20min" },
  { name: "Bottom Lash Tinting",  nameZh: "下睫毛染色", price: 20,  duration: "20min" },
  { name: "Top & Bottom Tinting", nameZh: "上下睫毛染色",price: 30, duration: "30min" },
  { name: "Eyebrow Tinting",      nameZh: "眉毛染色",   price: 30,  duration: "20min" },
  { name: "Bottom Lash Ext.",     nameZh: "下睫毛嫁接", price: 30,  duration: "30min" },
  { name: "Color Lash Ext.",      nameZh: "彩色睫毛嫁接",price: 25, duration: "20min" },
  { name: "Eyelash Removal",      nameZh: "睫毛卸除",   price: 20,  duration: "20min" },
  { name: "Brow Care",            nameZh: "眉毛護理",             isHeader: true },
  { name: "Lamination + Tint + Shape", nameZh: "定型+染色+修型", price: 75, duration: "45min" },
  { name: "Lamination + Shape",   nameZh: "定型+修型",  price: 60,  duration: "35min" },
  { name: "Waxing",               nameZh: "蜜蠟除毛",             isHeader: true },
  { name: "Eyebrow",              nameZh: "眉型蜜蠟",   price: 10,  duration: "15min" },
  { name: "Chin",                 nameZh: "下巴蜜蠟",   price: 20,  duration: "15min" },
  { name: "Upper Lip",            nameZh: "上唇蜜蠟",   price: 10,  duration: "10min" },
  { name: "PMU",                  nameZh: "半永久彩妝",            isHeader: true },
  { name: "Microblading",         nameZh: "飄眉",       price: 599, duration: "2hr" },
  { name: "Combination Brows",    nameZh: "組合眉",     price: 650, duration: "2hr 30min" },
  { name: "Ombre Powder Brows",   nameZh: "霧眉",       price: 599, duration: "2hr" },
  { name: "Nano Hairstroke Brows",nameZh: "納米髮絲眉", price: 599, duration: "2hr 30min" },
  { name: "6–8 Wk Touch Up",      nameZh: "6–8 週補色", price: 150, duration: "1hr 30min", note: "Existing clients", noteZh: "現有客戶" },
  { name: "Classic Eyeliner",     nameZh: "經典眼線",   price: 380, duration: "1hr 30min" },
  { name: "Lash Line Enhancement",nameZh: "睫毛根部填充",price: 350, duration: "1hr 15min" },
  { name: "Add-On Bottom Liner",  nameZh: "加購下眼線", price: 100, duration: "30min",     note: "Add-on only", noteZh: "加購項目" },
];

// ─── Sub-components ───────────────────────────────────────────────

function LashCard({ lang, tier, tierZh, badge, desc, descZh, photo, types, bookHref }: {
  lang: Lang; tier: string; tierZh: string; badge: string;
  desc: string; descZh: string; photo: string;
  types: LashServiceType[]; bookHref: string;
}) {
  const zh = lang === "zh";
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col bg-white">
      {/* Photo */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Image src={photo} alt={tier} fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" sizes="(max-width:1024px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-5 left-6 text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]">{badge}</span>
      </div>

      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-neutral-100">
        <h2 className="text-[1.75rem] font-light text-[#1C1C1C] leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {zh ? tierZh : tier}
        </h2>
        <p className="text-[12px] text-neutral-400 leading-[1.7]">{zh ? descZh : desc}</p>
      </div>

      {/* Service type accordion */}
      <div className="flex-1 divide-y divide-neutral-100">
        {types.map((svc) => {
          const isOpen = open === svc.name;
          return (
            <div key={svc.name}>
              <button
                onClick={() => setOpen(isOpen ? null : svc.name)}
                className="w-full flex items-center justify-between px-8 py-4 group hover:bg-neutral-50 transition-colors duration-200"
              >
                <span className="text-[13px] text-[#1C1C1C] tracking-[0.01em] group-hover:text-[#C9A84C] transition-colors duration-200">
                  {zh ? svc.nameZh : svc.name}
                </span>
                <span className={`text-[#C9A84C] text-[1rem] leading-none transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[400px]" : "max-h-0"}`}>
                <div className="px-8 pb-4 divide-y divide-neutral-50">
                  {svc.rows.map(({ pcs, price, dur }) => (
                    <div key={pcs} className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-600 font-medium">{zh ? `${pcs}根` : `${pcs}pcs`}</span>
                        <div className="flex items-center gap-5">
                          <span className="text-[11px] text-neutral-300">{dur}</span>
                          <span className="text-[13px] text-[#C9A84C] min-w-[52px] text-right">${price}</span>
                        </div>
                      </div>
                      {svc.showDesc && NEW_SET_DESC[pcs] && (
                        <p className="text-[11px] text-neutral-400 leading-[1.65] mt-1 pr-4">
                          {zh ? NEW_SET_DESC[pcs].zh : NEW_SET_DESC[pcs].en}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="p-8 pt-6">
        <Link
          href={bookHref}
          className="block w-full text-center text-[10px] uppercase tracking-[0.35em] bg-[#1C1C1C] text-white py-4 hover:bg-[#C9A84C] transition-colors duration-300"
        >
          {zh ? "立即預約" : "Book Now"}
        </Link>
      </div>
    </div>
  );
}

function FillsPmuCard({ lang, bookHref }: { lang: Lang; bookHref: string }) {
  const zh = lang === "zh";
  const [open, setOpen] = useState<string | null>(null);

  // Group items by header
  const groups: { header: FlatItem; items: FlatItem[] }[] = [];
  let current: { header: FlatItem; items: FlatItem[] } | null = null;
  for (const item of FILLS_PMU) {
    if (item.isHeader) {
      current = { header: item, items: [] };
      groups.push(current);
    } else if (current) {
      current.items.push(item);
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Photo */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Image src="/images/studio-room.jpg" alt="Fills, Care & PMU" fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" sizes="(max-width:1024px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-5 left-6 text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]">
          {zh ? "護理與半永久" : "Care & PMU"}
        </span>
      </div>

      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-neutral-100">
        <h2 className="text-[1.75rem] font-light text-[#1C1C1C] leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {zh ? "補睫、護理與半永久" : "Fills, Care & PMU"}
        </h2>
        <p className="text-[12px] text-neutral-400 leading-[1.7]">
          {zh ? "睫毛補睫、燙翹、眉型護理、蜜蠟除毛及半永久彩妝服務。" : "Refills, lash lifts, brow care, waxing, and permanent makeup services."}
        </p>
      </div>

      {/* Groups accordion */}
      <div className="flex-1 divide-y divide-neutral-100">
        {groups.map((g) => {
          const key = g.header.name;
          const isOpen = open === key;
          return (
            <div key={key}>
              <button
                onClick={() => setOpen(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-8 py-4 group hover:bg-neutral-50 transition-colors duration-200"
              >
                <span className="text-[13px] text-[#1C1C1C] tracking-[0.01em] group-hover:text-[#C9A84C] transition-colors duration-200">
                  {zh ? g.header.nameZh : g.header.name}
                </span>
                <span className={`text-[#C9A84C] text-[1rem] leading-none transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px]" : "max-h-0"}`}>
                <div className="px-8 pb-4 divide-y divide-neutral-50">
                  {g.items.map((item) => (
                    <div key={item.name} className="flex items-start justify-between py-2.5 gap-4">
                      <div>
                        <p className="text-[12px] text-neutral-600">{zh ? item.nameZh : item.name}</p>
                        {(item.note || item.noteZh) && (
                          <p className="text-[10px] text-neutral-300 mt-0.5">{zh ? item.noteZh : item.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {item.duration && <span className="text-[11px] text-neutral-300">{item.duration}</span>}
                        {item.price != null && <span className="text-[13px] text-[#C9A84C] min-w-[48px] text-right">${item.price}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="p-8 pt-6">
        <Link
          href={bookHref}
          className="block w-full text-center text-[10px] uppercase tracking-[0.35em] bg-[#1C1C1C] text-white py-4 hover:bg-[#C9A84C] transition-colors duration-300"
        >
          {zh ? "立即預約" : "Book Now"}
        </Link>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────

export default function ServicesAccordion({ lang }: Props) {
  const zh = lang === "zh";
  const bookHref = `/${lang}/booking`;

  const msTypes = buildLashTypes(MS);
  const pcTypes = buildLashTypes(PC);

  return (
    <>
      {/* ── Photo Mosaic placeholder — add lash work photos here when ready ── */}

      {/* ── Service Cards ── */}
      <section className="bg-[#F8F5EF] py-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Section heading */}
          <div className="text-center mb-14">
            <p className="text-[9px] uppercase tracking-[0.55em] text-[#C9A84C] mb-4">
              {zh ? "服務菜單" : "Service Menu"}
            </p>
            <h2
              className="text-[2.4rem] font-light text-[#1C1C1C] leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {zh ? "選擇您的服務" : "Select Your Service"}
            </h2>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LashCard
              lang={lang}
              tier="Mink / Silk"
              tierZh="Mink / Silk"
              badge={zh ? "經典系列" : "Classic"}
              desc="Faux Mink lashes with a semi-matte finish. Natural, fine, and lightweight."
              descZh="半霧面光澤，毛體纖細自然，呈現清新素顏感。"
              photo="/images/studio-treatment.jpg"
              types={msTypes}
              bookHref={bookHref}
            />
            <LashCard
              lang={lang}
              tier="Premium / Cashmere"
              tierZh="Premium / Cashmere"
              badge={zh ? "頂級系列" : "Premium"}
              desc="Royal Cashmere lashes with a concave base and split tip. Softer, fuller, more luxurious."
              descZh="凹弧底部、分叉尖端，更豐盈、更柔軟的奢華體驗。"
              photo="/images/studio-beds.jpg"
              types={pcTypes}
              bookHref={bookHref}
            />
            <FillsPmuCard lang={lang} bookHref={bookHref} />
          </div>

        </div>
      </section>
    </>
  );
}

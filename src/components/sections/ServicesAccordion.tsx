"use client";

import { useState } from "react";
import { type Lang } from "@/i18n";

type ServiceRow = {
  name: string;
  nameZh: string;
  price?: number;
  priceLabel?: string;   // for ranges like "$30–$150"
  duration?: string;
  note?: string;
  noteZh?: string;
  desc?: string;
  descZh?: string;
  isGroupHeader?: boolean;
};

type Material = {
  name: string;
  desc: string;
  descZh: string;
  avail: string;
};

type Category = {
  id: string;
  label: string;
  labelZh: string;
  materials?: Material[];
  items: ServiceRow[];
};

const categories: Category[] = [
  {
    id: "eyelash-extensions",
    label: "Eyelash Extensions",
    labelZh: "睫毛嫁接",
    materials: [
      {
        name: "Faux Mink",
        desc: "A semi-matte finish and a steep taper, the body of this eyelash extension is finer and looks all natural.",
        descZh: "半霧面光澤、尖端漸細，毛體纖細自然，呈現清新素顏感。",
        avail: "Available in B, C, D curl",
      },
      {
        name: "Royal Cashmere",
        desc: "These lashes have a concave base, matte finish and split tip, giving you the look of fuller lashes with a more natural and softer finish.",
        descZh: "凹弧底部設計、霧面光澤、分叉尖端，讓睫毛顯得更豐盈，同時保有柔軟自然的感覺。",
        avail: "Available in B, C, D curl",
      },
    ],
    items: [
      { name: "Mink / Silk",           nameZh: "Mink / Silk",           isGroupHeader: true },
      { name: "Mink/Silk 60pcs — New Set",  nameZh: "Mink/Silk 60根 — 全新嫁接",  priceLabel: "$30–$150",  duration: "30–60min" },
      { name: "Mink/Silk 80pcs — New Set",  nameZh: "Mink/Silk 80根 — 全新嫁接",  priceLabel: "$40–$170",  duration: "35–75min" },
      { name: "Mink/Silk 100pcs — New Set", nameZh: "Mink/Silk 100根 — 全新嫁接", priceLabel: "$50–$220",  duration: "40min–1hr 30min" },
      { name: "Mink/Silk 120pcs — New Set", nameZh: "Mink/Silk 120根 — 全新嫁接", priceLabel: "$60–$260",  duration: "45min–1hr 45min" },
      { name: "Mink/Silk 140pcs — New Set", nameZh: "Mink/Silk 140根 — 全新嫁接", priceLabel: "$70–$280",  duration: "50min–2hr" },
      { name: "Mink/Silk 180pcs — New Set", nameZh: "Mink/Silk 180根 — 全新嫁接", priceLabel: "$80–$340",  duration: "55min–2hr 15min" },

      { name: "Premium / Cashmere",    nameZh: "Premium / Cashmere",    isGroupHeader: true },
      { name: "Premium/Cashmere 60pcs — New Set",  nameZh: "Premium/Cashmere 60根 — 全新嫁接",  priceLabel: "$50–$180",  duration: "30–60min" },
      { name: "Premium/Cashmere 80pcs — New Set",  nameZh: "Premium/Cashmere 80根 — 全新嫁接",  priceLabel: "$80–$200",  duration: "35–75min" },
      { name: "Premium/Cashmere 100pcs — New Set", nameZh: "Premium/Cashmere 100根 — 全新嫁接", priceLabel: "$70–$250",  duration: "40min–1hr 30min" },
      { name: "Premium/Cashmere 120pcs — New Set", nameZh: "Premium/Cashmere 120根 — 全新嫁接", priceLabel: "$80–$290",  duration: "45min–1hr 45min" },
      { name: "Premium/Cashmere 140pcs — New Set", nameZh: "Premium/Cashmere 140根 — 全新嫁接", priceLabel: "$90–$310",  duration: "50min–2hr" },
      { name: "Premium/Cashmere 180pcs — New Set", nameZh: "Premium/Cashmere 180根 — 全新嫁接", priceLabel: "$100–$370", duration: "55min–2hr 15min" },
    ],
  },
  {
    id: "fills-care",
    label: "Fills & Care",
    labelZh: "補睫與護理",
    items: [
      { name: "Refills",        nameZh: "補睫",     isGroupHeader: true },
      { name: "1 Week Refill",  nameZh: "一週補睫", price: 40, duration: "1hr", note: "4–7 days",   noteZh: "4–7 天後" },
      { name: "2 Week Refill",  nameZh: "兩週補睫", price: 50, duration: "1hr", note: "8–14 days",  noteZh: "8–14 天後" },
      { name: "3 Week Refill",  nameZh: "三週補睫", price: 70, duration: "1hr", note: "15–21 days", noteZh: "15–21 天後" },

      { name: "Other Services",         nameZh: "其他服務", isGroupHeader: true },
      { name: "Eyelash Lift",           nameZh: "睫毛燙翹",       price: 79, duration: "45min" },
      { name: "Eyelash Tinting",        nameZh: "睫毛染色",       price: 20, duration: "20min" },
      { name: "Bottom Lash Tinting",    nameZh: "下睫毛染色",     price: 20, duration: "20min" },
      { name: "Top & Bottom Lash Tinting", nameZh: "上下睫毛染色", price: 30, duration: "30min" },
      { name: "Eyebrow Tinting",        nameZh: "眉毛染色",       price: 30, duration: "20min" },
      { name: "Bottom Lash Extension",  nameZh: "下睫毛嫁接",     price: 30, duration: "30min" },
      { name: "Color Lash Extension",   nameZh: "彩色睫毛嫁接",   price: 25, duration: "20min" },
      { name: "Eyelash Removal",        nameZh: "睫毛卸除",       price: 20, duration: "20min" },

      { name: "Brow Care",  nameZh: "眉毛護理", isGroupHeader: true },
      { name: "Brows Lamination & Tinting & Shaping", nameZh: "眉毛定型 + 染色 + 修型", price: 75, duration: "45min" },
      { name: "Brows Lamination & Shaping",           nameZh: "眉毛定型 + 修型",       price: 60, duration: "35min" },

      { name: "Waxing",    nameZh: "蜜蠟除毛", isGroupHeader: true },
      { name: "Eyebrow",   nameZh: "眉型蜜蠟", price: 10, duration: "15min" },
      { name: "Cheeks",    nameZh: "臉頰蜜蠟", price: 15, duration: "15min" },
      { name: "Chin",      nameZh: "下巴蜜蠟", price: 20, duration: "15min" },
      { name: "Upper Lip", nameZh: "上唇蜜蠟", price: 10, duration: "10min" },
      { name: "Lower Lip", nameZh: "下唇蜜蠟", price: 10, duration: "10min" },
    ],
  },
  {
    id: "pmu",
    label: "PMU",
    labelZh: "半永久彩妝",
    items: [
      { name: "Brows (PMU)", nameZh: "眉毛（半永久）", isGroupHeader: true },
      { name: "Microblading",           nameZh: "飄眉",         price: 599, duration: "2hr" },
      { name: "Combination Brows",      nameZh: "組合眉",       price: 650, duration: "2hr 30min" },
      { name: "Ombre Powder Brows",     nameZh: "霧眉",         price: 599, duration: "2hr" },
      { name: "Nano Hairstroke Brows",  nameZh: "納米髮絲眉",   price: 599, duration: "2hr 30min" },
      { name: "6–8 Week Touch Up",      nameZh: "6–8 週補色",   price: 150, duration: "1hr 30min", note: "Existing clients only", noteZh: "現有客戶限定" },

      { name: "Lip", nameZh: "唇部", isGroupHeader: true },
      { name: "6–8 Week Touch Up", nameZh: "6–8 週補色", price: 150, duration: "1hr 30min" },

      { name: "Eyes", nameZh: "眼部", isGroupHeader: true },
      { name: "Classic Eyeliner (Top Liner)",      nameZh: "經典眼線（上眼線）",     price: 380, duration: "1hr 30min" },
      { name: "Lash Line Enhancement (Top Liner)", nameZh: "睫毛根部填充（上眼線）", price: 350, duration: "1hr 15min" },
      { name: "Add-On Bottom Liner",               nameZh: "加購下眼線",             price: 100, duration: "30min", note: "Add-on only", noteZh: "加購項目" },
    ],
  },
];

type Props = { lang: Lang };

export default function ServicesAccordion({ lang }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-[680px] mx-auto px-6 sm:px-10 pt-16 pb-32">
      {categories.map((cat) => {
        const isOpen = open === cat.id;
        return (
          <div key={cat.id}>
            <button
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center justify-between py-7 group"
            >
              <span
                className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-light text-[#1C1C1C] tracking-[-0.01em] group-hover:text-[#C9A84C] transition-colors duration-300"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {lang === "zh" ? cat.labelZh : cat.label}
              </span>
              <span className={`text-[#C9A84C] text-[1.4rem] font-light transition-transform duration-300 leading-none ${isOpen ? "rotate-45" : ""}`}>
                +
              </span>
            </button>

            <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? "max-h-[6000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pb-8">

                {/* Lash materials guide */}
                {cat.materials && (
                  <div className="mb-8">
                    <p className="text-[9px] uppercase tracking-[0.45em] text-[#C9A84C] mb-5">
                      {lang === "zh" ? "睫毛材質指南" : "Lash Materials Guide"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cat.materials.map((m) => (
                        <div key={m.name} className="border border-neutral-100 p-5">
                          <p className="text-[12px] font-medium text-[#1C1C1C] tracking-[0.04em] mb-2">{m.name}</p>
                          <p className="text-[11.5px] text-neutral-400 leading-[1.75] mb-2">
                            {lang === "zh" ? m.descZh : m.desc}
                          </p>
                          <p className="text-[10px] text-[#C9A84C] tracking-[0.04em]">{m.avail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service rows */}
                {cat.items.map((item, j) => {
                  /* Group sub-header */
                  if (item.isGroupHeader) {
                    return (
                      <div key={j} className="pt-6 pb-2 first:pt-0">
                        <p className="text-[9px] uppercase tracking-[0.45em] text-[#C9A84C]">
                          {lang === "zh" ? item.nameZh : item.name}
                        </p>
                      </div>
                    );
                  }

                  const descText = lang === "zh" ? item.descZh : item.desc;
                  const descParts = descText ? descText.split("\n\n") : [];
                  const displayPrice = item.priceLabel ?? (item.price != null ? `$${item.price}` : null);

                  return (
                    <div key={j} className="py-5 border-b border-neutral-100 last:border-0">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <p className="text-[13px] text-[#1C1C1C] tracking-[0.01em] leading-snug">
                            {lang === "zh" ? item.nameZh : item.name}
                          </p>
                          {(item.note || item.noteZh) && (
                            <p className="text-[11px] text-neutral-300 mt-0.5">
                              {lang === "zh" ? item.noteZh : item.note}
                            </p>
                          )}
                          {descParts.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-[12px] text-neutral-400 leading-[1.8]">
                                {descParts[0]}
                              </p>
                              {descParts[1] && (
                                <p className="text-[11px] text-neutral-300 leading-[1.7] italic">
                                  {descParts[1]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5">
                          {displayPrice && (
                            <span className="text-[13px] text-[#C9A84C]">{displayPrice}</span>
                          )}
                          {item.duration && (
                            <span className="text-[11px] text-neutral-300 whitespace-nowrap">{item.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-neutral-100" />
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { type Lang } from "@/i18n";

type ServiceRow = {
  name: string;
  nameZh: string;
  price: number;
  duration?: string;
  note?: string;
  noteZh?: string;
  desc?: string;
  descZh?: string;
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
      {
        name: "Classic - 60pc — New Set",
        nameZh: "經典入門款 60根 — 全新嫁接",
        price: 60,
        duration: "50 min",
        desc: "60pcs lashes on each eye, creating a Super Natural look.\n\nPlease note that this service is based on mink lashes. Upgrades to other types of eyelashes are subject to price adjustments.",
        descZh: "每眼精心嫁接 60 根睫毛，打造極致自然的裸妝感。\n\n注意：本服務以 Mink 睫毛為基礎，升級其他材質需額外補差價。",
      },
      {
        name: "Classic Natural - 80pc — New Set",
        nameZh: "經典自然款 80根 — 全新嫁接",
        price: 80,
        duration: "1 hr",
        desc: "The most natural, barely-there enhancement. Perfect for clients who want a soft, subtle look like naturally fuller lashes. Light length and definition with 80 lashes applied to each eye.\n\nPlease note that this service is based on mink lashes. Upgrades to other types of eyelashes are subject to price adjustments.",
        descZh: "最自然的裸妝提升，彷彿睫毛天生豐盈。適合追求低調、柔和感的客人，每眼嫁接 80 根，輕盈增添長度與輪廓。\n\n注意：本服務以 Mink 睫毛為基礎，升級其他材質需額外補差價。",
      },
      {
        name: "Classic Signature - 100pc — New Set",
        nameZh: "經典精選款 100根 — 全新嫁接",
        price: 100,
        duration: "1 hr 30 min",
        desc: "A soft, balanced enhancement between natural and defined. Adds gentle volume and length for a clean, polished look like perfectly applied mascara.\n\nPlease note that this service is based on mink lashes. Upgrades to other types of eyelashes are subject to price adjustments.",
        descZh: "介於自然與精緻之間的平衡美感，輕柔增添量感與長度，宛如完美刷上睫毛膏的效果。\n\n注意：本服務以 Mink 睫毛為基礎，升級其他材質需額外補差價。",
      },
      {
        name: "Classic Full - 120pc — New Set",
        nameZh: "經典全套款 120根 — 全新嫁接",
        price: 120,
        duration: "1 hr 30 min",
        desc: "Perfect for clients who want effortless beauty without daily mascara. This set creates a naturally enhanced look with soft length and volume like the perfect combination of mascara and a lash curler. 120 lashes are carefully applied to each eye for a refined, polished finish.\n\nPlease note that this service is based on mink lashes. Upgrades to other types of eyelashes are subject to price adjustments.",
        descZh: "適合想要免去日常睫毛膏煩惱的客人，打造宛如睫毛膏搭配夾睫毛器的自然捲翹效果。每眼精心嫁接 120 根，呈現精緻完美的妝感。\n\n注意：本服務以 Mink 睫毛為基礎，升級其他材質需額外補差價。",
      },
      {
        name: "Hybrid Set — New Set",
        nameZh: "混合全套 — 全新嫁接",
        price: 140,
        duration: "1 hr 30 min",
        desc: "This is the combination of the Classic Set and 3D Volume Set. Hybrid lashes will give you more volume and a fluffier look.\n\nPlease note that this service is based on mink lashes. Upgrades to other types of eyelashes are subject to price adjustment.",
        descZh: "結合經典單根與 3D 豐盈的混合嫁接，層次更豐富，蓬鬆感更強。\n\n注意：本服務以 Mink 睫毛為基礎，升級其他材質需額外補差價。",
      },
      {
        name: "Volume Set — New Set",
        nameZh: "豐盈全套 — 全新嫁接",
        price: 140,
        duration: "1 hr 30 min",
        desc: "A fuller, fluffier look with enhanced density and depth. Multiple lightweight lashes are applied to each natural lash, creating a soft yet dramatic finish. Perfect for clients who love bold, glamorous lashes.\n\nPlease note that this service is based on mink lashes. Upgrades to other types of eyelashes are subject to price adjustments.",
        descZh: "極致豐盈蓬鬆，密度與層次全面提升。多根輕盈睫毛嫁接於每根天然睫毛，打造柔軟而戲劇性的效果，適合鍾愛濃郁魅力眼妝的客人。\n\n注意：本服務以 Mink 睫毛為基礎，升級其他材質需額外補差價。",
      },
      {
        name: "Design Set — New Set",
        nameZh: "設計師套組 — 全新嫁接",
        price: 150,
        duration: "1 hr 30 min",
        desc: "The lash artist will design the most suitable eyelash for the client, for example Wispy and Anime looking eyelashes. The lash artist will introduce you to different choices of combinations at our studio.\n\nPlease note that this service is based on light volume lashes. Upgrades to Dramatic volume eyelashes are subject to price adjustments.",
        descZh: "由技師為您量身設計最適合的睫毛造型，例如羽毛感、動漫感等風格。技師會在到訪時為您介紹多種組合選擇。\n\n注意：本服務以輕豐盈睫毛為基礎，升級至濃密豐盈款需額外補差價。",
      },
    ],
  },
  {
    id: "fills-care",
    label: "Fills & Care",
    labelZh: "補睫與護理",
    items: [
      { name: "1 Week Refill",     nameZh: "一週補睫",   price: 40, duration: "1 hr", note: "4–7 days",   noteZh: "4–7 天後" },
      { name: "2 Week Refill",     nameZh: "兩週補睫",   price: 50, duration: "1 hr", note: "8–14 days",  noteZh: "8–14 天後" },
      { name: "3 Week Refill",     nameZh: "三週補睫",   price: 70, duration: "1 hr", note: "15–21 days", noteZh: "15–21 天後" },
      { name: "Lash Lift",         nameZh: "睫毛燙翹",   price: 60, duration: "1 hr" },
      { name: "Tint",              nameZh: "睫毛染色",   price: 30, duration: "30 min" },
      { name: "Lash Lift + Tint",  nameZh: "燙翹加染色", price: 80, duration: "75 min" },
      { name: "Eyelash Removal",   nameZh: "睫毛卸除",   price: 20, duration: "20 min" },
      { name: "Bottom Lashes",     nameZh: "下睫毛",     price: 30 },
      { name: "Colored Lashes",    nameZh: "彩色睫毛",   price: 15 },
      { name: "Brow Tint",         nameZh: "眉毛染色",   price: 30 },
      { name: "Eyebrow Wax",       nameZh: "眉型蜜蠟",   price: 15 },
      { name: "Lip or Chin Wax",   nameZh: "唇部或下巴蜜蠟", price: 10 },
    ],
  },
  {
    id: "pmu",
    label: "PMU",
    labelZh: "半永久彩妝",
    items: [
      { name: "Microblading",                          nameZh: "飄眉",                  price: 599, duration: "2.5 hr" },
      { name: "Combination Brows",                     nameZh: "組合眉",                price: 650, duration: "2.5 hr" },
      { name: "Ombre Powder Brows",                    nameZh: "霧眉",                  price: 599, duration: "2.5 hr" },
      { name: "Nano Hairstroke Brows",                 nameZh: "納米髮絲眉",            price: 599, duration: "2.5 hr" },
      { name: "6–8 Week Touch Up",                     nameZh: "6–8 週補色",            price: 150, duration: "1.5 hr", note: "Existing clients only", noteZh: "現有客戶限定" },
      { name: "Lip Blush",                             nameZh: "唇部暈染",              price: 599, duration: "2.5 hr", note: "Includes 6–8 week touch up", noteZh: "含 6–8 週補色" },
      { name: "Classic Eyeliner (Top Liner)",          nameZh: "經典眼線（上眼線）",    price: 380, duration: "2.5 hr" },
      { name: "Lash Line Enhancement (Top Liner)",     nameZh: "睫毛根部填充（上眼線）",price: 350, duration: "2.5 hr" },
      { name: "Add-On Bottom Liner",                   nameZh: "加購下眼線",            price: 100, note: "Add-on only", noteZh: "加購項目" },
      { name: "Brow Lamination + Tinting + Shaping",  nameZh: "眉毛定型 + 染色 + 修型",price: 75,  duration: "1 hr" },
      { name: "Brow Lamination + Shaping",             nameZh: "眉毛定型 + 修型",       price: 60,  duration: "1 hr" },
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

            <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"}`}>
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
                  const descText = lang === "zh" ? item.descZh : item.desc;
                  const descParts = descText ? descText.split("\n\n") : [];

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
                          <span className="text-[13px] text-[#C9A84C]">${item.price}</span>
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

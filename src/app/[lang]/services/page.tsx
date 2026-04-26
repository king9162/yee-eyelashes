import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import ServicesAccordion from "@/components/sections/ServicesAccordion";
import PromoBanner from "@/components/ui/PromoBanner";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "服務項目與價格 | YEE EYELASHES 曼哈薩特",
        description: "Yee Eyelashes 完整服務菜單：經典、混合、豐盈及超豐盈睫毛嫁接，睫毛燙翹，以及繡眉、霧眉、唇部紋繡。透明定價，立即預約。",
        openGraph: {
          title: "服務項目與價格 | YEE EYELASHES 曼哈薩特",
          description: "Yee Eyelashes 全套睫毛及半永久彩妝服務。透明定價，專業技師，位於紐約曼哈薩特。",
          url: "https://www.yeelashesny.com/zh/services",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Lash Extension Services & Pricing | YEE EYELASHES Manhasset NY",
        description: "Classic, hybrid, volume & mega-volume lash extensions in Manhasset, NY. Lash lifts & permanent makeup available. View our full service menu and transparent pricing.",
        openGraph: {
          title: "Lash Extension Services & Pricing | YEE EYELASHES Manhasset NY",
          description: "Full service menu: classic, hybrid, volume & mega-volume extensions, lash lifts, microblading & more. Manhasset, NY.",
          url: "https://www.yeelashesny.com/en/services",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

export default async function ServicesPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <div className="bg-[#F8F5EF] min-h-screen pt-[76px] md:pt-[130px]">
      <PromoBanner lang={lang} />

      {/* Page heading */}
      <div className="max-w-[680px] mx-auto px-6 sm:px-10 pt-16 pb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6 h-px bg-[#C9A84C]" />
          <span className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]">
            {lang === "zh" ? "服務菜單" : "Services Menu"}
          </span>
        </div>
        <h1
          className="font-light text-[#1C1C1C] leading-none tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.2rem,4vw,3.5rem)" }}
        >
          {lang === "zh" ? "所有服務" : "All Services"}
        </h1>
      </div>

      <ServicesAccordion lang={lang} />
    </div>
  );
}

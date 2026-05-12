import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import ServicesPreview from "@/components/sections/ServicesPreview";
import AftercareTips from "@/components/sections/AftercareTips";

const FAQSection = dynamic(() => import("@/components/sections/FAQSection"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));
const PromoPopup = dynamic(() => import("@/components/ui/PromoPopup"));

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "YEE EYELASHES | 紐約曼哈薩特頂級睫毛工作室",
        description:
          "Yee Eyelashes — 紐約曼哈薩特頂級睫毛工作室。提供 Real Mink、Premium Cashmere 及 3D 豐盈睫毛嫁接，以及半永久彩妝服務。立即預約，展現您的獨特魅力。",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/zh",
          languages: {
            "en": "https://www.yeeeyelashes.com/en",
            "zh-TW": "https://www.yeeeyelashes.com/zh",
            "x-default": "https://www.yeeeyelashes.com/en",
          },
        },
        openGraph: {
          title: "YEE EYELASHES | 紐約曼哈薩特頂級睫毛工作室",
          description: "曼哈薩特最專業的睫毛工作室。精緻睫毛嫁接，為您量身打造最適合的妝效。歡迎預約諮詢。",
          url: "https://www.yeeeyelashes.com/zh",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
        description:
          "Nassau County's premier lash studio. Real Mink, Premium Cashmere & 3D volume extensions custom-crafted for your eye shape. 278 Plandome Rd, Manhasset NY. Book today.",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/en",
          languages: {
            "en": "https://www.yeeeyelashes.com/en",
            "zh-TW": "https://www.yeeeyelashes.com/zh",
            "x-default": "https://www.yeeeyelashes.com/en",
          },
        },
        openGraph: {
          title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
          description:
            "Bespoke lash extensions designed for the discerning woman. Real Mink, Premium Cashmere & 3D volume sets handcrafted in Manhasset, NY. Serving Nassau County.",
          url: "https://www.yeeeyelashes.com/en",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

export default async function HomePage({ params }: Props) {
  const { lang: rawLang } = await params;

  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <>
      <PromoPopup lang={lang} />
      <Hero lang={lang} />
      <ServicesPreview lang={lang} />
      <AftercareTips lang={lang} />
      <ContactSection lang={lang} />
    </>
  );
}

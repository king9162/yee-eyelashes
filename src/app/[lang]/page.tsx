import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import Hero from "@/components/sections/Hero";
import ServicesPreview from "@/components/sections/ServicesPreview";
import GalleryPreview from "@/components/sections/GalleryPreview";
import Testimonials from "@/components/sections/Testimonials";
import InstagramFeed from "@/components/sections/InstagramFeed";
import FAQSection from "@/components/sections/FAQSection";
import ContactSection from "@/components/sections/ContactSection";
import AftercareTips from "@/components/sections/AftercareTips";
import PromoPopup from "@/components/ui/PromoPopup";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "YEE EYELASHES | 紐約曼哈薩特頂級睫毛工作室",
        description:
          "Yee Eyelashes — 紐約曼哈薩特頂級睫毛工作室。提供經典、混合、豐盈及超豐盈睫毛嫁接，以及睫毛燙翹與半永久彩妝服務。立即預約，展現您的獨特魅力。",
        openGraph: {
          title: "YEE EYELASHES | 紐約曼哈薩特頂級睫毛工作室",
          description: "曼哈薩特最專業的睫毛工作室。精緻睫毛嫁接，為您量身打造最適合的妝效。歡迎預約諮詢。",
          url: "https://yeeeyelashes.com/zh",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
        description:
          "Manhasset's luxury lash studio. Precision-crafted classic, hybrid, volume & mega-volume extensions — tailored for you. 278 Plandome Rd, NY. Book your appointment today.",
        openGraph: {
          title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
          description:
            "Bespoke lash extensions designed for the discerning woman. Classic, hybrid, volume & mega-volume sets — handcrafted in Manhasset, NY. Serving Nassau County.",
          url: "https://yeeeyelashes.com/en",
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
      <GalleryPreview lang={lang} />
      <Testimonials lang={lang} />
      <InstagramFeed lang={lang} />
      <FAQSection lang={lang} />
      <AftercareTips lang={lang} />
      <ContactSection lang={lang} />
    </>
  );
}

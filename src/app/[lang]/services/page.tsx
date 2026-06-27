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
        alternates: {
          canonical: "https://www.yeeeyelashes.com/zh/services",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/services",
            "zh-TW": "https://www.yeeeyelashes.com/zh/services",
            "x-default": "https://www.yeeeyelashes.com/en/services",
          },
        },
        openGraph: {
          title: "服務項目與價格 | YEE EYELASHES 曼哈薩特",
          description: "Yee Eyelashes 全套睫毛及半永久彩妝服務。透明定價，專業技師，位於紐約曼哈薩特。",
          url: "https://www.yeeeyelashes.com/zh/services",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Lash Extension Services & Pricing | YEE EYELASHES Manhasset NY",
        description: "Manhasset's top lash bar — Real Mink, Premium Cashmere, Design Style sparkle lashes & 3D volume lash extensions. Transparent pricing, new sets from $60. Book online today.",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/en/services",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/services",
            "zh-TW": "https://www.yeeeyelashes.com/zh/services",
            "x-default": "https://www.yeeeyelashes.com/en/services",
          },
        },
        openGraph: {
          title: "Lash Extension Services & Pricing | YEE EYELASHES Manhasset NY",
          description: "Real Mink from $60, Premium Cashmere from $80, Design Style sparkle lashes from $130, 3D Lashes from $150. Manhasset's top lash bar — expert artists, transparent pricing.",
          url: "https://www.yeeeyelashes.com/en/services",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

const servicesSpeakable = {
  "@context": "https://schema.org/",
  "@type": "WebPage",
  "name": "Lash Extension Services & Pricing | YEE EYELASHES Manhasset NY",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xPath": ["/html/head/title", "/html/head/meta[@name='description']/@content"],
  },
  "url": "https://www.yeeeyelashes.com/en/services",
};

const servicesBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yeeeyelashes.com/en" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://www.yeeeyelashes.com/en/services" },
  ],
};

const provider = {
  "@type": "LocalBusiness",
  name: "Yee Eyelashes",
  address: {
    "@type": "PostalAddress",
    streetAddress: "278 Plandome Rd, 2nd Floor",
    addressLocality: "Manhasset",
    addressRegion: "NY",
    postalCode: "11030",
    addressCountry: "US",
  },
};

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Yee Eyelashes Services",
  description: "Full service menu at Yee Eyelashes, Manhasset NY",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Real Mink Lash Extensions",
        description: "Classic faux mink lash extensions with a semi-matte finish. Natural, fine, and lightweight. New set from $60. Available in 60, 80, 100, and 120 lashes per eye.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "AggregateOffer", lowPrice: "60", highPrice: "120", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Premium Cashmere Lash Extensions",
        description: "Royal Cashmere lashes with a concave base and split tip. Softer, fuller, more luxurious. New set from $80.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "AggregateOffer", lowPrice: "80", highPrice: "180", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Design Style Lash Extensions",
        description: "Fully customized bespoke lash sets designed around your unique eye shape, facial structure, and personal style using Premium Cashmere materials. Starting at $130 in Manhasset, NY.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "Offer", price: "130", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "3D Volume Lash Extensions",
        description: "Multi-layered volume lashes for a full, dramatic look. Multiple ultra-fine fans applied per natural lash. Available in 140 and 180 lashes. Starting at $150.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "AggregateOffer", lowPrice: "150", highPrice: "170", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Service",
        name: "Refills and Care for Lashes",
        description: "1-week, 2-week, and 3-week refills and care for lashes to maintain your eyelash extensions. Starting at $30.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "AggregateOffer", lowPrice: "30", highPrice: "130", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 6,
      item: {
        "@type": "Service",
        name: "Microblading",
        description: "Semi-permanent eyebrow microblading for natural-looking hair strokes. Includes 6-8 week touch-up. Starting at $599.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "Offer", price: "599", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 7,
      item: {
        "@type": "Service",
        name: "Ombre Powder Brows",
        description: "Soft ombre powder brow permanent makeup for a filled, defined look. Starting at $599.",
        provider,
        areaServed: "Manhasset, NY",
        offers: { "@type": "Offer", price: "599", priceCurrency: "USD" },
      },
    },
  ],
};

export default async function ServicesPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <div className="bg-[#F8F5EF] min-h-screen pt-[76px] md:pt-[130px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSpeakable) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }} />
      <PromoBanner lang={lang} />
      <ServicesAccordion lang={lang} />
    </div>
  );
}

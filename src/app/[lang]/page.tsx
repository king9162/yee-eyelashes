import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import { faqs } from "@/data/faq";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import ServicesPreview from "@/components/sections/ServicesPreview";
import AftercareTips from "@/components/sections/AftercareTips";

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
        title: "Yee Eyelashes | Real Mink & Premium Cashmere Lash Extensions Manhasset NY",
        description:
          "Yee Eyelashes — Manhasset's premier lash studio specializing in Real Mink, Premium Cashmere, and Design Style lash extensions. New sets from $60. Lash Lift and Permanent Makeup. 278 Plandome Rd, Nassau County, NY. Book online.",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/en",
          languages: {
            "en": "https://www.yeeeyelashes.com/en",
            "zh-TW": "https://www.yeeeyelashes.com/zh",
            "x-default": "https://www.yeeeyelashes.com/en",
          },
        },
        openGraph: {
          title: "Yee Eyelashes | Real Mink & Premium Cashmere Lash Extensions Manhasset NY",
          description:
            "Manhasset's premier lash studio. Real Mink, Premium Cashmere, and Design Style lash extensions. New sets from $60. Lash Lift and Permanent Makeup. Serving Nassau County and Long Island.",
          url: "https://www.yeeeyelashes.com/en",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.questionEn,
    acceptedAnswer: { "@type": "Answer", text: faq.answerEn },
  })),
};

const homeBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yeeeyelashes.com/en" },
  ],
};

const speakableSchema = {
  "@context": "https://schema.org/",
  "@type": "WebPage",
  "name": "Yee Eyelashes | Real Mink & Premium Cashmere Lash Extensions Manhasset NY",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xPath": [
      "/html/head/title",
      "/html/head/meta[@name='description']/@content",
    ],
  },
  "url": "https://www.yeeeyelashes.com/en",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": "https://www.yeeeyelashes.com",
  name: "Yee Eyelashes",
  url: "https://www.yeeeyelashes.com",
  telephone: "+15169843859",
  address: {
    "@type": "PostalAddress",
    streetAddress: "278 Plandome Rd, 2nd Floor",
    addressLocality: "Manhasset",
    addressRegion: "NY",
    postalCode: "11030",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      opens: "09:30",
      closes: "19:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "61",
    bestRating: "5",
    worstRating: "1",
  },
  priceRange: "$$",
  description: "Yee Eyelashes is Manhasset's premier lash studio specializing in Real Mink, Premium Cashmere, Design Style, and 3D lash extensions. Located at 278 Plandome Rd, 2nd Floor, Manhasset, NY. Also offering Lash Lift, Lash Tint, and Permanent Makeup. Serving Nassau County and Long Island, NY.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Lash & Beauty Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Real Mink Lash Extensions", description: "Faux mink lash extensions with a semi-matte finish. Natural, fine, and lightweight. New sets from $60 in Manhasset, NY." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Premium Cashmere Lash Extensions", description: "Royal Cashmere lashes with a concave base and split tip. Softer, fuller, more luxurious. New sets from $80 in Manhasset, NY." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Design Style Lash Extensions", description: "Fully customized bespoke lash sets designed around your eye shape and personal style. Starting at $130 in Manhasset, NY." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "3D Volume Lash Extensions", description: "Multi-fan volume lashes for maximum fullness and dramatic impact. New sets from $150 in Manhasset, NY." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Refills and Care for Lashes", description: "1-week, 2-week, and 3-week lash refill services to maintain your eyelash extensions." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lash Lift & Tint", description: "Professional eyelash lift that curls and lifts natural lashes for 6–8 weeks, paired with lash tinting." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Permanent Makeup", description: "Microblading, ombre powder brows, combination brows, nano hairstroke brows, and permanent eyeliner." } },
    ],
  },
  areaServed: [
    { "@type": "City", name: "Manhasset" },
    { "@type": "AdministrativeArea", name: "Nassau County" },
    { "@type": "City", name: "Great Neck" },
    { "@type": "City", name: "Port Washington" },
    { "@type": "City", name: "Garden City" },
    { "@type": "City", name: "Long Island" },
  ],
  sameAs: ["https://www.instagram.com/yee_lashesny"],
};

export default async function HomePage({ params }: Props) {
  const { lang: rawLang } = await params;

  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      <PromoPopup lang={lang} />
      <Hero lang={lang} />
      <ServicesPreview lang={lang} />
      <AftercareTips lang={lang} />
      <ContactSection lang={lang} />
    </>
  );
}

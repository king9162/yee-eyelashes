import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import ContactSection from "@/components/sections/ContactSection";
import PageHeader from "@/components/ui/PageHeader";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "聯絡我們 | YEE EYELASHES — 278 Plandome Rd，曼哈薩特，紐約",
        description: "聯繫 Yee Eyelashes 預約或諮詢。地址：278 Plandome Rd, 2nd Floor，曼哈薩特，紐約。營業時間：週一至六 9:30 AM – 7:00 PM，週日公休。電話：929-806-2467。",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/zh/contact",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/contact",
            "zh-TW": "https://www.yeeeyelashes.com/zh/contact",
            "x-default": "https://www.yeeeyelashes.com/en/contact",
          },
        },
        openGraph: {
          title: "聯絡我們 | YEE EYELASHES 曼哈薩特",
          description: "Yee Eyelashes 位於 278 Plandome Rd，曼哈薩特，紐約。週一至六 9:30 AM–7:00 PM，週日公休。",
          url: "https://www.yeeeyelashes.com/zh/contact",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Contact Us | YEE EYELASHES — 278 Plandome Rd, Manhasset NY",
        description: "Visit Yee Eyelashes at 278 Plandome Rd, Manhasset, NY. Open Mon–Sat 9:30 AM–7:00 PM, Sun Closed. Call 929-806-2467 to book or ask about our lash services.",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/en/contact",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/contact",
            "zh-TW": "https://www.yeeeyelashes.com/zh/contact",
            "x-default": "https://www.yeeeyelashes.com/en/contact",
          },
        },
        openGraph: {
          title: "Contact Yee Eyelashes | Manhasset, NY",
          description: "278 Plandome Rd, 2nd Floor, Manhasset, NY 11030. Open Mon–Sat 9:30 AM–7:00 PM, Sun Closed. Call 929-806-2467.",
          url: "https://www.yeeeyelashes.com/en/contact",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

const contactSpeakable = {
  "@context": "https://schema.org/",
  "@type": "WebPage",
  "name": "Contact Yee Eyelashes | Manhasset, NY",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xPath": ["/html/head/title", "/html/head/meta[@name='description']/@content"],
  },
  "url": "https://www.yeeeyelashes.com/en/contact",
};

const contactLocalBusinessSchema = {
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
  description: "Visit Yee Eyelashes at 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030. Premier eyelash extension and lash artistry studio open Mon–Sat 9:30 AM–7:00 PM, Sun Closed. Call (516) 984-3859.",
};

type Props = { params: Promise<{ lang: string }> };

export default async function ContactPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSpeakable) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLocalBusinessSchema) }} />
      <PageHeader
        eyebrow={lang === "zh" ? "聯絡" : "Contact"}
        title={lang === "zh" ? "聯絡我們" : "Get in Touch"}
        subtitle={lang === "zh"
          ? "我們很樂意聆聽您的需求，並為您提供最佳建議。"
          : "We'd love to hear from you. Reach out any time."}
      />
      <ContactSection lang={lang} />
    </div>
  );
}

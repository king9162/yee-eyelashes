import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import FAQSection from "@/components/sections/FAQSection";
import { faqs } from "@/data/faq";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "常見問題 | YEE EYELASHES",
        description: "Yee Eyelashes 常見問題解答。了解睫毛嫁接、護理、預約及服務相關資訊。",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/zh/faq",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/faq",
            "zh-TW": "https://www.yeeeyelashes.com/zh/faq",
            "x-default": "https://www.yeeeyelashes.com/en/faq",
          },
        },
      }
    : {
        title: "Lash Extension FAQ | YEE EYELASHES Manhasset, NY",
        description: "Common questions about lash extensions in Manhasset, NY — how long they last, pricing, aftercare, safety, and what makes Yee Eyelashes different. Get answers before you book.",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/en/faq",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/faq",
            "zh-TW": "https://www.yeeeyelashes.com/zh/faq",
            "x-default": "https://www.yeeeyelashes.com/en/faq",
          },
        },
        openGraph: {
          title: "Lash Extension FAQ | Yee Eyelashes Manhasset NY",
          description: "Everything you want to know about lash extensions — how long they last, what they cost, how to prepare, and more. Serving Manhasset, Great Neck, and Nassau County.",
          url: "https://www.yeeeyelashes.com/en/faq",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

const faqSpeakable = {
  "@context": "https://schema.org/",
  "@type": "WebPage",
  "name": "Lash Extension FAQ | YEE EYELASHES Manhasset, NY",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xPath": ["/html/head/title", "/html/head/meta[@name='description']/@content"],
  },
  "url": "https://www.yeeeyelashes.com/en/faq",
};

const faqBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yeeeyelashes.com/en" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://www.yeeeyelashes.com/en/faq" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.questionEn,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answerEn,
    },
  })),
};

export default async function FAQPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSpeakable) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqBreadcrumb) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="pt-[130px]" />
      <FAQSection lang={lang} />
    </div>
  );
}

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
        description: "聯繫 Yee Eyelashes 預約或諮詢。地址：278 Plandome Rd 2FL，曼哈薩特，紐約。營業時間：週一至日 10:00 AM – 7:30 PM。電話：929-806-2467。",
        openGraph: {
          title: "聯絡我們 | YEE EYELASHES 曼哈薩特",
          description: "Yee Eyelashes 位於 278 Plandome Rd，曼哈薩特，紐約。週一至日 10 AM–7:30 PM 開放預約。",
          url: "https://www.yeeeyelashes.com/zh/contact",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Contact Us | YEE EYELASHES — 278 Plandome Rd, Manhasset NY",
        description: "Visit Yee Eyelashes at 278 Plandome Rd, Manhasset, NY. Open Mon–Sun 10 AM–7:30 PM. Call 929-806-2467 to book or ask about our lash services.",
        openGraph: {
          title: "Contact Yee Eyelashes | Manhasset, NY",
          description: "278 Plandome Rd 2FL, Manhasset, NY 11030. Open Mon–Sun 10 AM–7:30 PM. Call 929-806-2467.",
          url: "https://www.yeeeyelashes.com/en/contact",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

type Props = { params: Promise<{ lang: string }> };

export default async function ContactPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <div>
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

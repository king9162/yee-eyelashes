import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQSection from "@/components/sections/FAQSection";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "常見問題 | YEE EYELASHES",
        description: "Yee Eyelashes 常見問題解答。了解睫毛嫁接、護理、預約及服務相關資訊。",
      }
    : {
        title: "FAQ | YEE EYELASHES",
        description: "Frequently asked questions about lash extensions, aftercare, booking, and services at Yee Eyelashes in Manhasset, NY.",
      };
}

export default async function FAQPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const zh = lang === "zh";

  return (
    <div className="min-h-screen bg-white">
      <Header lang={lang} />

      {/* Header */}
      <div className="bg-[#F8F5EF] pt-[130px] pb-20 px-6 text-center border-b border-neutral-200">
        <p className="text-[9px] uppercase tracking-[0.55em] text-[#C9A84C] mb-4">
          {zh ? "常見問題" : "Questions"}
        </p>
        <h1
          className="text-[2.8rem] font-light text-[#1C1C1C] leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {zh ? "您最想知道的一切" : "Everything You Need to Know"}
        </h1>
        <div className="w-8 h-px bg-[#C9A84C] mx-auto mt-6" />
      </div>

      <FAQSection lang={lang} />

      <Footer lang={lang} />
    </div>
  );
}

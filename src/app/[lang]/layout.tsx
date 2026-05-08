import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BackToTop       = dynamic(() => import("@/components/ui/BackToTop"));
const DisableCopy     = dynamic(() => import("@/components/ui/DisableCopy"));
const MobileBookingBar = dynamic(() => import("@/components/ui/MobileBookingBar"));

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: {
      canonical: `https://www.yeeeyelashes.com/${lang}`,
      languages: {
        "en": "https://www.yeeeyelashes.com/en",
        "zh-TW": "https://www.yeeeyelashes.com/zh",
        "x-default": "https://www.yeeeyelashes.com/en",
      },
    },
    ...(lang === "zh" && {
      title: "YEE EYELASHES | 紐約曼哈薩特頂級睫毛工作室",
      description: "Yee Eyelashes 是曼哈薩特頂尖的睫毛嫁接工作室，專業提供經典、混合、豐盈及超豐盈睫毛嫁接。位於 278 Plandome Rd，曼哈薩特，紐約。服務拿騷縣全區。",
    }),
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang: rawLang } = await params;

  if (!isValidLang(rawLang)) {
    notFound();
  }

  const lang = rawLang as Lang;

  return (
    <div className="flex flex-col min-h-screen" lang={lang}>
      <Header lang={lang} />
      <main className="flex-1 pb-[52px] md:pb-0">{children}</main>
      <Footer lang={lang} />
      <BackToTop />
      <DisableCopy />
      <MobileBookingBar lang={lang} />
    </div>
  );
}

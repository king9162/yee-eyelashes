import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, getTranslations, type Lang } from "@/i18n";
import PageHeader from "@/components/ui/PageHeader";
import GalleryGrid from "@/components/sections/GalleryGrid";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "作品集 | YEE EYELASHES 睫毛嫁接作品 — 曼哈薩特，紐約",
        description: "欣賞 Yee Eyelashes 的最新睫毛嫁接作品。經典、混合、豐盈及超豐盈款式一覽。每一副都是精心雕琢的藝術，位於紐約曼哈薩特。",
        openGraph: {
          title: "作品集 | YEE EYELASHES 睫毛嫁接作品",
          description: "Yee Eyelashes 真實作品展示 — 經典、混合、豐盈及超豐盈款式。紐約曼哈薩特頂級睫毛工作室。",
          url: "https://yeeeyelashes.com/zh/gallery",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Lash Extension Gallery | YEE EYELASHES Manhasset NY",
        description: "See the artistry at Yee Eyelashes. Real results — classic, hybrid, volume & mega-volume lash extensions by Manhasset's most sought-after lash studio.",
        openGraph: {
          title: "Lash Extension Gallery | YEE EYELASHES Manhasset NY",
          description: "Browse our portfolio of classic, hybrid, volume & mega-volume lash extensions. Premium artistry in Manhasset, Nassau County, NY.",
          url: "https://yeeeyelashes.com/en/gallery",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

export default async function GalleryPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const t = getTranslations(lang);

  return (
    <div className="pb-28">
      <PageHeader
        eyebrow={lang === "zh" ? "作品集" : "Portfolio"}
        title={t.gallery_preview.heading}
        subtitle={lang === "zh"
          ? "瀏覽我們的最新作品——每一套都是為您量身打造。"
          : "Browse our latest work — every set crafted to perfection."}
      />
      <GalleryGrid />
    </div>
  );
}

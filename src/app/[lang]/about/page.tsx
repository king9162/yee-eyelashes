import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "關於我們 | YEE EYELASHES — 曼哈薩特，紐約",
        description: "認識 Yee Eyelashes。我們是位於紐約曼哈薩特的專業睫毛工作室，致力於為每位客戶提供個人化、高品質的睫毛嫁接與半永久彩妝服務。",
        openGraph: {
          title: "關於我們 | Yee Eyelashes 曼哈薩特",
          description: "認識我們的團隊與理念。Yee Eyelashes 位於紐約曼哈薩特，專注於高品質睫毛嫁接與半永久彩妝。",
          url: "https://www.yeeeyelashes.com/zh/about",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "About Us | YEE EYELASHES — Manhasset, NY",
        description: "Learn about Yee Eyelashes, Manhasset's premier lash studio. We specialize in precision lash extensions and permanent makeup, tailored to each client's unique eye shape and lifestyle.",
        openGraph: {
          title: "About Yee Eyelashes | Manhasset, NY",
          description: "Manhasset's premier lash studio — precision extensions, permanent makeup, and a personalized approach for every client.",
          url: "https://www.yeeeyelashes.com/en/about",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}

type Props = { params: Promise<{ lang: string }> };

export default async function AboutPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const zh = lang === "zh";

  const bookHref = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";

  return (
    <div>
      <PageHeader
        eyebrow={zh ? "關於我們" : "About Us"}
        title={zh ? "精工之美，源於用心" : "Crafted with Precision, Built on Care"}
        subtitle={zh
          ? "每一副睫毛，都是我們對美的承諾。"
          : "Every set is a reflection of our commitment to your beauty."}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Left: Story */}
            <div>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
                  {zh ? "我們的故事" : "Our Story"}
                </span>
              </div>

              <h2
                className="text-[2rem] md:text-[2.6rem] font-light text-[#1C1C1C] leading-tight mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {zh ? "Yee Eyelashes" : "Yee Eyelashes"}
              </h2>

              <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
                {zh ? (
                  <>
                    <p>
                      Yee Eyelashes 位於紐約曼哈薩特 Plandome Rd 278 號，是一家專注於精工睫毛嫁接與半永久彩妝的精品工作室。
                    </p>
                    <p>
                      我們相信，真正出色的睫毛源於對細節的執著。每位客人到來，我們都會先進行深入諮詢，了解您的眼型、骨骼輪廓與日常生活方式，再為您量身打造最適合的款式與材質。
                    </p>
                    <p>
                      我們只選用醫用級黏合劑與頂級輕量睫毛纖維，確保每一次服務都安全、舒適，並對您的天然睫毛零傷害。
                    </p>
                    <p>
                      無論您是初次嫁接的新客，還是多年來一直信賴我們的老朋友，我們都以同樣的用心與專注，為您呈現最完美的效果。
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Yee Eyelashes is a boutique lash and permanent makeup studio located at 278 Plandome Rd, Manhasset, NY — serving clients across Nassau County and Long Island.
                    </p>
                    <p>
                      We believe that truly exceptional lashes begin with listening. Every appointment starts with a thorough consultation where we study your eye shape, bone structure, and lifestyle before selecting a single lash. The result is a set that is uniquely yours — not just beautiful, but effortless to wear.
                    </p>
                    <p>
                      We use only medical-grade, formaldehyde-free adhesives and premium lightweight lash fibers selected for both beauty and safety. Your natural lash health is never compromised.
                    </p>
                    <p>
                      Whether you're a first-time client or a longtime regular, you'll receive the same level of precision, care, and attention to detail that has made Yee Eyelashes a trusted name in Manhasset and beyond.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right: Values */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
                  {zh ? "我們的理念" : "Our Values"}
                </span>
              </div>

              {[
                {
                  titleEn: "Personalized for You",
                  titleZh: "為您量身打造",
                  descEn: "No two clients are the same. We design every set around your unique eye shape, lifestyle, and preferences — never a one-size-fits-all approach.",
                  descZh: "每位客人都是獨特的。我們根據您的眼型、生活方式與個人喜好量身設計，從不套用固定模板。",
                },
                {
                  titleEn: "Lasting Results",
                  titleZh: "持久效果",
                  descEn: "Precision technique and premium materials mean your lashes look great longer. We also provide personalized aftercare guidance at every visit.",
                  descZh: "精準技術與優質材料讓您的睫毛效果更持久。我們也會在每次服務後提供個人化的保養建議。",
                },
                {
                  titleEn: "Trusted in Manhasset",
                  titleZh: "曼哈薩特的信賴之選",
                  descEn: "Clients travel from Great Neck, Port Washington, Garden City, Queens, and Manhattan to visit us. Our reputation is built one lash at a time.",
                  descZh: "客人從大頸、波士頓港、花園城、皇后區與曼哈頓專程到訪。我們的口碑，是每一根睫毛換來的。",
                },
              ].map((v) => (
                <div key={v.titleEn} className="flex gap-6">
                  <div className="w-px bg-[#C9A84C]/30 flex-shrink-0" />
                  <div>
                    <h3
                      className="text-[1.05rem] font-light text-[#1C1C1C] mb-2"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {zh ? v.titleZh : v.titleEn}
                    </h3>
                    <p className="text-[13px] text-neutral-400 leading-[1.85]">
                      {zh ? v.descZh : v.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 pt-14 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
            <Link
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.35em] bg-[#1C1C1C] text-white px-10 py-4 hover:bg-[#C9A84C] transition-colors duration-300 whitespace-nowrap"
            >
              {zh ? "立即預約" : "Book Your Appointment"}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-300 whitespace-nowrap"
            >
              {zh ? "聯絡我們 →" : "Contact Us →"}
            </Link>
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
          </div>

        </div>
      </section>
    </div>
  );
}

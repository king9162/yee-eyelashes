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
        alternates: {
          canonical: "https://www.yeeeyelashes.com/zh/about",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/about",
            "zh-TW": "https://www.yeeeyelashes.com/zh/about",
            "x-default": "https://www.yeeeyelashes.com/en/about",
          },
        },
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
        title: "Lash Extensions & Lash Bar in Manhasset, NY | YEE EYELASHES",
        description: "Yee Eyelashes is Manhasset's premier lash bar — specializing in Real Mink, Premium Cashmere, Design Style, and 3D eyelash extensions. Long lasting results, personalized for your eye shape. Serving Nassau County and Long Island.",
        alternates: {
          canonical: "https://www.yeeeyelashes.com/en/about",
          languages: {
            "en": "https://www.yeeeyelashes.com/en/about",
            "zh-TW": "https://www.yeeeyelashes.com/zh/about",
            "x-default": "https://www.yeeeyelashes.com/en/about",
          },
        },
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

const aboutSpeakable = {
  "@context": "https://schema.org/",
  "@type": "WebPage",
  "name": "About Yee Eyelashes | Manhasset, NY",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xPath": ["/html/head/title", "/html/head/meta[@name='description']/@content"],
  },
  "url": "https://www.yeeeyelashes.com/en/about",
};

const aboutBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yeeeyelashes.com/en" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://www.yeeeyelashes.com/en/about" },
  ],
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Yee Eyelashes",
  description: "Yee Eyelashes is a boutique lash and permanent makeup studio located at 278 Plandome Rd, Manhasset, NY, serving clients across Nassau County and Long Island.",
  url: "https://www.yeeeyelashes.com/en/about",
  mainEntity: {
    "@type": "BeautySalon",
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "61",
      bestRating: "5",
      worstRating: "1",
    },
    knowsAbout: [
      "Eyelash Extensions",
      "3D Lashes",
      "Real Mink Lashes",
      "Precision Lash Artistry",
      "Lash Refills and Care",
      "Lash Lift",
      "Permanent Makeup",
      "Microblading",
      "Ombre Powder Brows",
    ],
    areaServed: [
      { "@type": "City", name: "Manhasset" },
      { "@type": "AdministrativeArea", name: "Nassau County" },
      { "@type": "City", name: "Great Neck" },
      { "@type": "City", name: "Port Washington" },
      { "@type": "City", name: "Garden City" },
    ],
  },
};

type Props = { params: Promise<{ lang: string }> };

export default async function AboutPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const zh = lang === "zh";

  const bookHref = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSpeakable) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      <PageHeader
        eyebrow={zh ? "關於我們" : "About Us"}
        title={zh ? "精工之美，源於用心" : "Lash Extensions & Lash Bar in Manhasset, NY"}
        subtitle={zh
          ? "每一副睫毛，都是我們對美的承諾。"
          : "Yee Eyelashes — where precision meets care, one lash at a time."}
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
                      無論您是初次嫁接的新客，還是多年來一直信賴我們的老朋友，我們都以同樣的用心與專注，為您呈現最完美的效果。
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Yee Eyelashes is Manhasset's premier lash bar and boutique studio, located at 278 Plandome Rd, 2nd Floor, Manhasset, NY, serving clients across Nassau County and Long Island.
                    </p>
                    <p>
                      We believe that truly exceptional lashes begin with listening. Every appointment starts with a thorough consultation where we study your eye shape, bone structure, and lifestyle before selecting a single lash. The result is a set that is uniquely yours, not just beautiful, but effortless to wear.
                    </p>

                    <p>
                      Whether you're a first-time client or a longtime regular, you'll receive the same level of precision, care, and attention to detail that has made Yee Eyelashes a trusted name in Manhasset and beyond. Our eyelash extensions are designed for long lasting results — beautiful, comfortable, and effortless from day one.
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
                  descEn: "No two clients are the same. We design every set around your unique eye shape, lifestyle, and preferences. Never a one-size-fits-all approach.",
                  descZh: "每位客人都是獨特的。我們根據您的眼型、生活方式與個人喜好量身設計，從不套用固定模板。",
                },
                {
                  titleEn: "Lasting Results",
                  titleZh: "持久效果",
                  descEn: "Precision technique and premium materials mean your lashes look great longer. We also provide personalized aftercare guidance at every visit.",
                  descZh: "精準技術與優質材料讓您的睫毛效果更持久。我們也會在每次服務後提供個人化的保養建議。",
                },
                {
                  titleEn: "Manhasset's Lash Bar of Choice",
                  titleZh: "曼哈薩特的首選睫毛店",
                  descEn: "Clients travel from Great Neck, Port Washington, Garden City, Queens, and Manhattan to visit our lash bar in Manhasset. Our reputation is built one lash at a time.",
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

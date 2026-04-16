import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, getTranslations, type Lang } from "@/i18n";
import { contact } from "@/data/contact";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "立即預約 | YEE EYELASHES 曼哈薩特，紐約",
        description: "立即預約 Yee Eyelashes 的睫毛嫁接服務。經典、混合、豐盈及超豐盈款式任君選擇。電話 929-806-2467 或 Instagram 私訊預約。",
        openGraph: {
          title: "立即預約 | YEE EYELASHES 曼哈薩特",
          description: "預約您的專屬睫毛服務。電話或 Instagram 私訊均可，我們期待您的光臨。",
          url: "https://yeeeyelashes.com/zh/booking",
          type: "website",
          locale: "zh_TW",
          siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Book Your Lash Appointment | YEE EYELASHES Manhasset NY",
        description: "Book your lash appointment at Yee Eyelashes, Manhasset NY. Classic to mega-volume sets available. Call 929-806-2467 or DM us on Instagram to reserve your spot.",
        openGraph: {
          title: "Book Your Lash Appointment | YEE EYELASHES Manhasset NY",
          description: "Reserve your lash appointment at Yee Eyelashes. Classic, hybrid, volume & mega-volume sets in Manhasset, NY. Call or DM on Instagram.",
          url: "https://yeeeyelashes.com/en/booking",
          type: "website",
          locale: "en_US",
          siteName: "Yee Eyelashes",
        },
      };
}
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

type Props = { params: Promise<{ lang: string }> };

export default async function BookingPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const t = getTranslations(lang);

  const steps = [
    {
      n: "01",
      title: lang === "zh" ? "選擇您的服務" : "Choose Your Service",
      body:  lang === "zh" ? "瀏覽我們的服務菜單，找到適合您的睫毛風格。" : "Browse our services menu to find the lash style that's right for you.",
    },
    {
      n: "02",
      title: lang === "zh" ? "選擇日期和時間" : "Select a Date & Time",
      body:  lang === "zh" ? "從我們的可用時段中選擇最方便的時間。" : "Pick a time that works for you from our available slots.",
    },
    {
      n: "03",
      title: lang === "zh" ? "確認預約" : "Confirm Your Booking",
      body:  lang === "zh" ? "我們將在24小時內透過電郵或電話確認您的預約。" : "We'll confirm your appointment within 24 hours by email or phone.",
    },
  ];

  return (
    <div className="pb-28">
      <PageHeader
        eyebrow={lang === "zh" ? "預約" : "Booking"}
        title={t.booking.heading}
        subtitle={t.booking.subheading}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Left: steps + policy */}
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.45em] text-[#C9A84C] mb-10">
              {lang === "zh" ? "預約流程" : "How It Works"}
            </p>

            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.n} className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-[#C9A84C]/25 text-[#C9A84C] text-[9px] tracking-[0.2em]">
                    {step.n}
                  </div>
                  <div className="pt-1">
                    <p className="text-[13px] font-medium text-[#1C1C1C] mb-2 tracking-[0.01em]">{step.title}</p>
                    <p className="text-[13px] text-neutral-400 leading-[1.85] tracking-[0.01em]">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Policy note */}
            <div className="mt-12 bg-[#F8F5EF] px-8 py-7">
              <p className="text-[9.5px] uppercase tracking-[0.4em] text-[#C9A84C] mb-3">
                {lang === "zh" ? "取消政策" : "Cancellation Policy"}
              </p>
              <p className="text-[13px] text-neutral-400 leading-[1.85] tracking-[0.01em]">
                {lang === "zh"
                  ? "請提前至少24小時通知取消或更改預約。晚取消或缺席可能需收取費用。"
                  : "Please notify us at least 24 hours in advance for cancellations or changes. Late cancellations or no-shows may incur a fee."}
              </p>
            </div>
          </div>

          {/* Right: booking widget */}
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.45em] text-[#C9A84C] mb-10">
              {lang === "zh" ? "立即預約" : "Reserve Your Appointment"}
            </p>

            <div className="bg-[#FAFAF8] p-10 xl:p-14 text-center flex flex-col items-center gap-7 min-h-72">
              {/* Calendar icon */}
              <svg className="w-10 h-10 text-neutral-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>

              <div>
                <p className="text-[13px] text-neutral-500 mb-1.5 tracking-[0.02em]">
                  {lang === "zh" ? "線上預約系統即將推出" : "Online booking coming soon"}
                </p>
                <p className="text-[11px] text-neutral-300 tracking-wide">
                  {lang === "zh" ? "目前請透過以下方式預約" : "In the meantime, reach us via"}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-[260px]">
                <a
                  href={`tel:${contact.phone}`}
                  className="text-[10px] uppercase tracking-[0.25em] bg-[#1C1C1C] text-white py-4 hover:bg-[#C9A84C] hover:text-[#1C1C1C] transition-all duration-300 text-center"
                >
                  {lang === "zh" ? "電話預約" : "Call to Book"}
                </a>
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-[0.25em] border border-neutral-200 text-neutral-500 py-4 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 text-center"
                >
                  {lang === "zh" ? "Instagram 私訊" : "DM on Instagram"}
                </a>
              </div>
            </div>

            <p className="text-[11px] text-neutral-300 text-center mt-4 tracking-[0.02em]">
              {t.booking.note}
            </p>
          </div>
        </div>

        {/* Services link */}
        <div className="mt-24 pt-12 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
          <p className="text-[13px] text-neutral-400 tracking-[0.01em]">
            {lang === "zh" ? "需要查看服務和價格？" : "Need to view services and pricing?"}
          </p>
          <Link
            href={`/${lang}/services`}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500 hover:text-[#C9A84C] transition-colors duration-300"
          >
            {lang === "zh" ? "查看服務" : "View Services"}
            <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#C9A84C]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

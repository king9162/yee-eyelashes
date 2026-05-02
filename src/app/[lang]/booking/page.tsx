import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import Script from "next/script";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "立即預約 | YEE EYELASHES 曼哈薩特，紐約",
        description: "立即預約 Yee Eyelashes 的睫毛嫁接服務。經典、混合、豐盈及超豐盈款式任君選擇。電話 929-806-2467 或 Instagram 私訊預約。",
        openGraph: {
          title: "立即預約 | YEE EYELASHES 曼哈薩特",
          description: "預約您的專屬睫毛服務。電話或 Instagram 私訊均可，我們期待您的光臨。",
          url: "https://www.yeeeyelashes.com/zh/booking",
          type: "website", locale: "zh_TW", siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Book Your Lash Appointment | YEE EYELASHES Manhasset NY",
        description: "Book your lash appointment at Yee Eyelashes, Manhasset NY. Classic to mega-volume sets available. Call 929-806-2467 or DM us on Instagram to reserve your spot.",
        openGraph: {
          title: "Book Your Lash Appointment | YEE EYELASHES Manhasset NY",
          description: "Reserve your lash appointment at Yee Eyelashes. Classic, hybrid, volume & mega-volume sets in Manhasset, NY.",
          url: "https://www.yeeeyelashes.com/en/booking",
          type: "website", locale: "en_US", siteName: "Yee Eyelashes",
        },
      };
}

type Props = { params: Promise<{ lang: string }> };

export default async function BookingPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;

  return (
    <div className="min-h-screen bg-[#F8F5EF] pt-[76px] md:pt-[130px] pb-20">
      <div className="text-center py-10">
        <p className="text-[9px] uppercase tracking-[0.55em] text-[#C9A84C] mb-3">
          {lang === "zh" ? "預約" : "Booking"}
        </p>
        <h1
          className="text-[2.2rem] font-light text-[#1C1C1C]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {lang === "zh" ? "預約您的服務" : "Book Your Appointment"}
        </h1>
      </div>
      <Script
        src="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

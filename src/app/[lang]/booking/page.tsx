import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import PageHeader from "@/components/ui/PageHeader";
import BookingForm from "@/components/sections/BookingForm";

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
          type: "website", locale: "zh_TW", siteName: "Yee Eyelashes",
        },
      }
    : {
        title: "Book Your Lash Appointment | YEE EYELASHES Manhasset NY",
        description: "Book your lash appointment at Yee Eyelashes, Manhasset NY. Classic to mega-volume sets available. Call 929-806-2467 or DM us on Instagram to reserve your spot.",
        openGraph: {
          title: "Book Your Lash Appointment | YEE EYELASHES Manhasset NY",
          description: "Reserve your lash appointment at Yee Eyelashes. Classic, hybrid, volume & mega-volume sets in Manhasset, NY.",
          url: "https://yeeeyelashes.com/en/booking",
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
    <div className="pb-28">
      <PageHeader
        eyebrow={lang === "zh" ? "預約" : "Booking"}
        title={lang === "zh" ? "預約您的服務" : "Book Your Appointment"}
        subtitle={lang === "zh" ? "請填寫以下資料，我們將在 24 小時內確認您的預約" : "Fill in your details and we'll confirm your appointment within 24 hours"}
      />
      <BookingForm lang={lang} />
    </div>
  );
}

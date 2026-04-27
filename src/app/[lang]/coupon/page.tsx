import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import { promotions } from "@/data/promotions";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? {
        title: "優惠活動 | YEE EYELASHES",
        description: "查看 Yee Eyelashes 最新優惠與折扣活動。新客優惠、季節限定特惠，立即預約享受專屬折扣。",
      }
    : {
        title: "Promotions & Offers | YEE EYELASHES",
        description: "Browse current promotions and special offers at Yee Eyelashes. New client discounts and seasonal deals — book today.",
      };
}

export default async function CouponPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const zh = lang === "zh";

  const active = promotions.filter((p) => p.active);

  return (
    <div className="min-h-screen bg-[#F8F5EF]">

      {/* Header */}
      <div className="bg-[#1C1C1C] py-24 px-6 text-center">
        <p className="text-[9px] uppercase tracking-[0.55em] text-[#C9A84C] mb-4">
          {zh ? "限時優惠" : "Special Offers"}
        </p>
        <h1
          className="text-[2.8rem] font-light text-white leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {zh ? "專屬優惠活動" : "Current Promotions"}
        </h1>
        <div className="w-8 h-px bg-[#C9A84C] mx-auto mt-6" />
      </div>

      {/* Promotions */}
      <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-20">
        {active.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[13px] text-neutral-400">
              {zh ? "目前沒有進行中的優惠，請稍後再來查看。" : "No active promotions at this time. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.map((promo) => (
              <div key={promo.id} className="bg-white border-l-4 border-[#C9A84C] px-8 py-8">

                {/* Tag */}
                <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-4">
                  {zh ? "限時優惠" : "Limited Time Offer"}
                </p>

                {/* Title */}
                <h2
                  className="text-[1.8rem] font-light text-[#1C1C1C] mb-4 leading-snug"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {zh ? promo.titleZh : promo.title}
                </h2>

                {/* Description */}
                <p className="text-[14px] text-neutral-600 leading-[1.9] mb-4">
                  {zh ? promo.descriptionZh : promo.description}
                </p>

                {/* Note */}
                {(promo.note || promo.noteZh) && (
                  <p className="text-[12px] text-neutral-400 leading-[1.8] mb-6">
                    * {zh ? promo.noteZh : promo.note}
                  </p>
                )}

                {/* CTA */}
                <Link
                  href={`/${lang}/booking`}
                  className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white bg-[#1C1C1C] px-8 py-3.5 hover:bg-[#C9A84C] transition-all duration-300"
                >
                  {zh ? "立即預約" : "Book Now"}
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Bottom note */}
        <p className="text-center text-[11.5px] text-neutral-400 mt-16 leading-[1.8]">
          {zh
            ? "優惠不可與其他折扣同時使用。如有疑問請聯絡我們。"
            : "Offers cannot be combined with other discounts. Contact us if you have any questions."}
        </p>
      </div>
    </div>
  );
}

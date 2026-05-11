import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function PromoBanner({ lang }: Props) {
  return (
    <div className="sticky top-[76px] md:top-[130px] z-40 bg-[#c0905a]">
      <div className="max-w-[680px] mx-auto px-6 sm:px-10 py-4 flex flex-col items-center gap-1">
        <p className="text-[13px] sm:text-[16px] md:text-[20px] font-bold text-[#1C1C1C] tracking-[0.02em] text-center leading-snug">
          {lang === "zh"
            ? <>新客戶專屬 · 首次到訪享 30% 折扣<br />全線眼睫毛服務 · 無需折扣碼，到店直接套用</>
            : <>New Clients · 30% Off Your First Visit<br />All Eyelash Extensions · Discount applied on-site</>}
        </p>
      </div>
    </div>
  );
}

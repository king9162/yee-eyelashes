import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function PromoBanner({ lang }: Props) {
  return (
    <div className="sticky top-[76px] md:top-[130px] z-40 bg-[#c0905a]">
      <div className="max-w-[680px] mx-auto px-6 sm:px-10 py-4 flex flex-col items-center gap-1">
        <p className="text-[13px] sm:text-[16px] md:text-[20px] font-bold text-[#1C1C1C] tracking-[0.02em] text-center leading-snug">
          {lang === "zh"
            ? <>母親節限時優惠 · 新客戶首次到訪<br />全線眼睫毛服務享 50% 折扣，即日起至 5/10</>
            : <>Mother&apos;s Day Special · New Clients Only<br />50% Off Eyelash Extensions · Until May 10</>}
        </p>
      </div>
    </div>
  );
}

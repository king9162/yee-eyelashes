import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function PromoBanner({ lang }: Props) {
  return (
    <div className="sticky top-[76px] md:top-[130px] z-40 bg-[#c0905a]">
      <div className="max-w-[680px] mx-auto px-6 sm:px-10 py-4 flex flex-col items-center gap-1">
        <p className="text-[18px] md:text-[24px] font-bold text-[#1C1C1C] tracking-[0.03em] text-center">
          {lang === "zh" ? "首次到訪享 30% 折扣" : "30% OFF FOR THE FIRST TIME VISIT."}
        </p>
        <p className="text-[13px] md:text-[18px] text-[#1C1C1C] leading-[1.6] text-center">
          {lang === "zh"
            ? "請於下方預約，折扣將於到店時直接套用。"
            : "Please make an appointment below, and the discount will be applied on-site."}
        </p>
      </div>
    </div>
  );
}

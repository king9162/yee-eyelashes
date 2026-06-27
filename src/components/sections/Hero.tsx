import HeroSlider from "@/components/ui/HeroSlider";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function Hero({ lang }: Props) {
  return (
    <section className="relative w-full overflow-hidden h-[65vw] md:h-[56vw] md:max-h-[820px]">
      <h1 className="sr-only">
        {lang === "zh"
          ? "紐約曼哈薩特頂級睫毛工作室 — Yee Eyelashes"
          : "Luxury Lash Extensions in Manhasset, NY — Yee Eyelashes"}
      </h1>
      <HeroSlider />
    </section>
  );
}

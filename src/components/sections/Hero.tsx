import HeroSlider from "@/components/ui/HeroSlider";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function Hero({ lang: _ }: Props) {
  return (
    <section className="relative w-full overflow-hidden h-[65vw] md:h-[56vw] md:max-h-[820px]">
      <HeroSlider />
    </section>
  );
}

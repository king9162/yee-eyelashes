import HeroSlider from "@/components/ui/HeroSlider";
import { type Lang } from "@/i18n";

type Props = { lang: Lang };

export default function Hero({ lang: _ }: Props) {
  return (
    <section
      className="relative w-full overflow-hidden h-[50vw] md:h-[clamp(480px,90vh,980px)]"
    >
      <HeroSlider />
    </section>
  );
}

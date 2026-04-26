import { Lang, getTranslations } from "@/i18n";
import { testimonials } from "@/data/testimonials";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = { lang: Lang };

export default function Testimonials({ lang }: Props) {
  const t = getTranslations(lang);

  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

        <SectionTitle
          heading={t.testimonials.heading}
          subheading={t.testimonials.subheading}
          eyebrow={lang === "zh" ? "客戶評價" : "Client Stories"}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-[#FAFAF8] hover:bg-[#F5F0E6] transition-colors duration-500 px-6 py-8 sm:px-8 sm:py-9 lg:px-10 lg:py-11 xl:px-12 xl:py-12 relative overflow-hidden"
            >
              {/* Decorative oversized quote */}
              <div
                className="absolute -top-3 right-8 text-[6rem] sm:text-[9rem] leading-none text-neutral-100 group-hover:text-[#C9A84C]/8 transition-colors duration-500 select-none pointer-events-none"
                style={{ fontFamily: "var(--font-serif)" }}
                aria-hidden
              >
                "
              </div>

              {/* Review text — the hero of each card */}
              <blockquote
                className="relative text-[1.05rem] leading-[1.85] font-light italic text-neutral-600 mb-9 tracking-[0.01em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {lang === "zh" ? testimonial.reviewZh : testimonial.reviewEn}
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center justify-between pt-5 border-t border-neutral-200/50">
                <div>
                  <p className="text-[12px] font-medium text-[#1C1C1C] tracking-[0.05em] mb-0.5">
                    {lang === "zh" ? testimonial.nameZh : testimonial.nameEn}
                  </p>
                  <p className="text-[9.5px] uppercase tracking-[0.3em] text-[#C9A84C]">
                    {testimonial.service}
                  </p>
                </div>

                {/* Stars — minimal, right-aligned */}
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} className="w-2.5 h-2.5 text-[#C9A84C]/60 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Lang, getTranslations } from "@/i18n";
import { contact } from "@/data/contact";

type Props = { lang: Lang };

export default function Footer({ lang }: Props) {
  const t = getTranslations(lang);

  const navLinks = [
    { label: t.nav.home,     href: `/${lang}` },
    { label: t.nav.services, href: `/${lang}/services` },
    { label: t.nav.booking,  href: `/${lang}/booking` },
    { label: t.nav.contact,  href: `/${lang}/contact` },
  ];

  return (
    <footer>

      {/* ── Pre-footer CTA band ── */}
      <div className="bg-[#F8F5EF] border-t border-neutral-200/60">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-20 flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:justify-between gap-8">
          <div>
            <p
              className="text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] font-light text-[#1C1C1C] leading-tight mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {lang === "zh" ? "準備好提升您的眼妝了嗎？" : "Ready to elevate your look?"}
            </p>
            <p className="text-[13px] text-neutral-400 tracking-[0.02em]">
              {lang === "zh" ? "立即預約，讓美麗的蛻變從今日開始。" : "Book your appointment today and let the transformation begin."}
            </p>
          </div>
          <Link
            href="https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63"
            className="w-full md:w-auto flex-shrink-0 text-center text-[10px] uppercase tracking-[0.25em] text-[#1C1C1C] border border-[#1C1C1C] px-10 py-4 hover:bg-[#1C1C1C] hover:text-white transition-all duration-300"
          >
            {t.nav.booking}
          </Link>
        </div>
      </div>

      {/* ── Main footer ── */}
      <div className="bg-[#111]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">

          {/* Top section */}
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-14 md:gap-0 pb-10 border-b border-white/[0.05]">

            {/* ── Col 1: Brand block ── */}
            <div className="flex flex-col items-center">
              <Link href={`/${lang}`} className="group">
                <Image
                  src="/images/yee-logo-v1-cropped.png"
                  alt="Yee Eyelashes"
                  width={4000}
                  height={1340}
                  className="h-[70px] sm:h-[105px] w-auto brightness-0 invert transition-opacity duration-300 group-hover:opacity-75"
                  sizes="(max-width: 640px) 210px, 314px"
                />
              </Link>
              <p className="text-white/65 text-[13px] leading-[1.8] tracking-[0.08em] whitespace-nowrap mt-9">
                {t.footer.tagline}
              </p>
            </div>

            {/* ── Col 2: Location & Phone — absolutely centered ── */}
            <div className="md:absolute md:left-1/2 md:-translate-x-1/2 md:top-0">
              <div className="flex flex-col gap-8 items-center text-center">
                <div>
                  <p className="text-white/35 text-[9.5px] uppercase tracking-[0.4em] mb-3">
                    {t.contact.address_label}
                  </p>
                  <p className="text-white/75 text-[13px] sm:text-[15px] tracking-[0.02em] leading-[1.7]">
                    {contact.address}
                  </p>
                </div>
                <div>
                  <p className="text-white/35 text-[9.5px] uppercase tracking-[0.4em] mb-3">
                    {t.contact.phone_label}
                  </p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-white/75 hover:text-[#C9A84C] text-[13px] sm:text-[15px] tracking-[0.02em] transition-colors duration-300"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* ── Col 3: Hours — right on desktop, center on mobile ── */}
            <div className="flex justify-center md:justify-end md:ml-auto">
              <div className="text-center md:text-left">
                <p className="text-white/35 text-[9.5px] uppercase tracking-[0.4em] mb-3">
                  {lang === "zh" ? "營業時間" : "Hours"}
                </p>
                <div className="flex flex-col gap-2 items-center md:items-start">
                  {contact.hours.map((row) => (
                    <div key={row.days} className="flex gap-5">
                      <span className="text-white/50 text-[13px] tracking-[0.02em] w-24 flex-shrink-0">
                        {lang === "zh" ? row.daysZh : row.days}
                      </span>
                      <span className="text-white/75 text-[13px] tracking-[0.02em]">
                        {row.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-4 pb-2 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-3 sm:gap-0">
            <p className="text-white/30 text-[9px] tracking-[0.05em]">
              {t.footer.copyright}
            </p>
            <div className="flex gap-5">
              <Link href={`/${lang}/privacy`} className="text-white/30 hover:text-white/50 text-[9px] tracking-wide transition-colors">
                Privacy Policy
              </Link>
              <Link href={`/${lang}/terms`} className="text-white/30 hover:text-white/50 text-[9px] tracking-wide transition-colors">
                Terms
              </Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

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
    { label: t.nav.gallery,  href: `/${lang}/gallery` },
    { label: t.nav.booking,  href: `/${lang}/booking` },
    { label: t.nav.contact,  href: `/${lang}/contact` },
  ];

  return (
    <footer>

      {/* ── Pre-footer CTA band ── */}
      <div className="bg-[#F8F5EF] border-t border-neutral-200/60">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p
              className="text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] font-light text-[#1C1C1C] leading-tight mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {lang === "zh" ? "準備好提升您的眼妝了嗎？" : "Ready to elevate your look?"}
            </p>
            <p className="text-[13px] text-neutral-400 tracking-[0.02em]">
              {lang === "zh" ? "立即預約，讓美麗的蛻變從今日開始。" : "Book your appointment today and let the transformation begin."}
            </p>
          </div>
          <Link
            href={`/${lang}/booking`}
            className="flex-shrink-0 text-[10px] uppercase tracking-[0.25em] text-[#1C1C1C] border border-[#1C1C1C] px-10 py-4 hover:bg-[#1C1C1C] hover:text-white transition-all duration-300"
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
              <div className="flex justify-between mt-7 w-full">
                {/* Instagram */}
                <div className="flex flex-col items-center gap-2 text-white/40 p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  <span className="text-[9px] uppercase tracking-[0.35em]">Instagram</span>
                </div>

                {/* RedNote */}
                <div className="flex flex-col items-center gap-2 text-white/40 p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972.794.794 0 0 0-.884-.618.795.795 0 0 0-.692.794c0 .101-.002.666.001.777zm-11.509 4.808c-.203.001-1.353.004-1.685.003a2.528 2.528 0 0 1-.766-.126.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124.66.01 1.32.002 1.981 0 .01 0 .02-.006.023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01a.834.834 0 0 0-.01.08c-.027.397-.038.495-.234 3.06-.012.24-.034.389-.135.607-.026.057-.033.042.003.112.046.092.681 1.523.787 1.74.008.015.011.02.017.02.008 0 .033-.026.047-.044.147-.187.268-.391.371-.606.306-.635.44-1.325.486-1.706.014-.11.021-.22.03-.33l.204-2.616.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.427 1.427 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.443.443 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293c.076.982.153 1.964.233 2.946.05.4.186 1.085.487 1.706.103.215.223.419.37.606.015.018.037.051.048.049.02-.003.742-1.642.804-1.765.036-.07.03-.055.003-.112zm3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56c-.01 0-.02.006-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.534.534 0 0 0-.02.191.46.46 0 0 0 .23.378.981.981 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.53.53 0 0 0-.023.172.465.465 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001c.01 0 .02-.006.023-.015l.575-1.28a.025.025 0 0 0-.024-.035zm-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829 0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047.001.037.465 1.064.555 1.263.01.02.03.033.051.033.157.003.767.009.938-.014.153-.02.3-.06.438-.132.3-.156.49-.419.595-.765.052-.172.075-.353.075-.533.002-2.33 0-4.66-.007-6.991a.032.032 0 0 0-.032-.032zm11.784 6.896c0-.014-.01-.021-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084-.37 0-1.11-.002-1.304 0-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036c.006.01.013.008.058.008 1.748.003 3.495.002 5.243.002.03-.001.034-.006.035-.033v-1.539zm4.177-3.43c0 .013-.007.023-.02.024-.346.006-.692.004-1.037.004-.014-.002-.022-.01-.022-.024-.005-.434-.007-.869-.01-1.303 0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015.093.025.16.107.165.204.006.431.002 1.153.001 1.153zm2.67.244a1.953 1.953 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21c0-.132-.007-.263-.025-.394a1.823 1.823 0 0 0-.153-.53 1.533 1.533 0 0 0-.677-.71 2.167 2.167 0 0 0-1-.258c-.153-.003-.567 0-.72 0-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007c-.006.006-.008.012-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128V11.19s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003c.098 0 .191.02.28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185 0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033.184.437.374.871.57 1.303a.045.045 0 0 0 .04.026c.17.005.34.002.51.003.15-.002.517.004.666-.01a2.03 2.03 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981c0-.128-.01-.254-.034-.38 0 .078-.029-.641-.724-.998z"/>
                  </svg>
                  <span className="text-[9px] uppercase tracking-[0.35em]">RedNote</span>
                </div>

                {/* TikTok */}
                <div className="flex flex-col items-center gap-2 text-white/40 p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                  </svg>
                  <span className="text-[9px] uppercase tracking-[0.35em]">TikTok</span>
                </div>
              </div>
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

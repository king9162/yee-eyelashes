"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Lang, getTranslations } from "@/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";

type Props = { lang: Lang };

export default function Header({ lang }: Props) {
  const t = getTranslations(lang);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t.nav.home,     href: `/${lang}` },
    { label: t.nav.services, href: `/${lang}/services` },
    { label: t.nav.coupon,   href: `/${lang}/coupon` },
    { label: t.nav.contact,  href: `/${lang}/contact` },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-500",
        scrolled
          ? "border-b border-neutral-100 shadow-[0_1px_0_rgba(0,0,0,0.03),0_4px_24px_rgba(0,0,0,0.04)]"
          : "border-b border-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:pl-6 lg:pr-16">

        {/* ── Desktop: [Logo] [Nav centered] [Controls] ── */}
        <div className="hidden md:flex items-center h-[130px]">

          {/* Zone 1 — Logo, far left, fixed width to balance Zone 3 */}
          <div className="flex items-center" style={{ width: "320px" }}>
            <Link href={`/${lang}`} className="group flex items-center">
              <Image
                src="/images/yee-logo-v1-cropped.png"
                alt="Yee Eyelashes"
                width={800}
                height={268}
                className="h-[88px] w-auto transition-opacity duration-300 group-hover:opacity-75"
                sizes="320px"
                priority
              />
            </Link>
          </div>

          {/* Zone 2 — Nav, absolutely centered in the header */}
          <nav className="flex-1 flex justify-center items-center gap-10 lg:gap-14">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-[11px] uppercase tracking-[0.38em] transition-colors duration-300 py-1",
                  isActive(link.href)
                    ? "text-[#C9A84C]"
                    : "text-neutral-400 hover:text-neutral-800"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-px left-0 w-full h-px bg-[#C9A84C]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Zone 3 — Controls, far right, fixed width to match Zone 1 */}
          <div className="flex items-center justify-end gap-8" style={{ width: "320px" }}>
            <LanguageSwitcher currentLang={lang} />
            <Link
              href={`/${lang}/booking`}
              className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 px-7 py-3 border border-neutral-300 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-500 whitespace-nowrap"
            >
              {t.nav.booking}
            </Link>
          </div>
        </div>

        {/* ── Mobile: logo left, controls right ── */}
        <div className="flex md:hidden items-center justify-between h-[76px]">
          <Link href={`/${lang}`} className="group flex items-center">
            <Image
              src="/images/yee-logo-v1-cropped.png"
              alt="Yee Eyelashes"
              width={4000}
              height={1340}
              className="h-[38px] w-auto transition-opacity duration-300 group-hover:opacity-75"
              sizes="120px"
              priority
            />
          </Link>
          <div className="flex items-center gap-5">
            <LanguageSwitcher currentLang={lang} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="flex flex-col gap-[5px] p-3"
            >
              <span className={cn("block w-[22px] h-px bg-neutral-700 transition-all duration-300 origin-center", menuOpen && "rotate-45 translate-y-[6px]")} />
              <span className={cn("block w-[22px] h-px bg-neutral-700 transition-all duration-300", menuOpen && "opacity-0 scale-x-0")} />
              <span className={cn("block w-[22px] h-px bg-neutral-700 transition-all duration-300 origin-center", menuOpen && "-rotate-45 -translate-y-[6px]")} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={cn(
          "md:hidden bg-white overflow-hidden transition-all duration-400",
          menuOpen ? "max-h-[420px] border-t border-neutral-100" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "text-[10.5px] uppercase tracking-[0.22em] py-4 border-b border-neutral-50 last:border-0 transition-colors",
                isActive(link.href) ? "text-[#C9A84C]" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`/${lang}/booking`}
            onClick={() => setMenuOpen(false)}
            className="mt-5 text-center text-[10.5px] uppercase tracking-[0.22em] text-neutral-800 border border-neutral-800 py-3.5 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
          >
            {t.nav.booking}
          </Link>
        </nav>
      </div>
    </header>
  );
}

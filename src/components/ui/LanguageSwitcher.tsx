"use client";

import { usePathname, useRouter } from "next/navigation";
import { Lang } from "@/i18n";

type Props = {
  currentLang: Lang;
};

export default function LanguageSwitcher({ currentLang }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLang = (lang: Lang) => {
    const newPath = pathname.replace(/^\/(en|zh)/, `/${lang}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center text-[9.5px] tracking-[0.2em] uppercase">
      <button
        onClick={() => switchLang("en")}
        className={`px-2 py-2 transition-colors duration-300 ${
          currentLang === "en"
            ? "text-[#C9A84C]"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-neutral-300 text-[8px]">/</span>
      <button
        onClick={() => switchLang("zh")}
        className={`px-2 py-2 transition-colors duration-300 ${
          currentLang === "zh"
            ? "text-[#C9A84C]"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
        aria-label="切換為繁體中文"
      >
        中文
      </button>
    </div>
  );
}

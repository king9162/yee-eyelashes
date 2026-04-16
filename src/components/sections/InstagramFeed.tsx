import Image from "next/image";
import { Lang, getTranslations } from "@/i18n";
import { contact } from "@/data/contact";

type Props = { lang: Lang };

const photos = [
  { src: "/images/gallery-1.jpg", alt: "Lash extension result at Yee Eyelashes" },
  { src: "/images/gallery-2.jpg", alt: "Lash extension result at Yee Eyelashes" },
  { src: "/images/gallery-3.jpg", alt: "Lash extension result at Yee Eyelashes" },
];

export default function InstagramFeed({ lang }: Props) {
  const t = getTranslations(lang);

  return (
    <section className="bg-[#F8F5EF]">

      {/* Section label */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-10">
        <div className="flex items-center gap-5">
          <div className="w-8 h-px bg-[#C9A84C]" />
          <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
            Instagram
          </span>
          <div className="flex-1 h-px bg-neutral-200/60" />
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9.5px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-300 hidden sm:block"
          >
            {contact.instagram}
          </a>
        </div>
      </div>

      {/* Photo grid */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-3 gap-4">
          {photos.map((photo) => (
            <a
              key={photo.src}
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full overflow-hidden bg-neutral-100 group"
              style={{ aspectRatio: "9/16" }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 400px"
              />
            </a>
          ))}
        </div>
      </div>

      {/* CTA below grid */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 flex items-center justify-between">
        <p
          className="text-[1.5rem] font-light text-neutral-400 hidden md:block"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t.instagram.subheading}
        </p>
        <a
          href={contact.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-[#C9A84C] transition-colors duration-300"
        >
          {t.instagram.cta}
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#C9A84C]">→</span>
        </a>
      </div>

    </section>
  );
}

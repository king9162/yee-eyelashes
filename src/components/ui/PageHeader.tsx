type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="bg-[#F8F5EF] pt-[76px] md:pt-[130px] pb-20 px-6 border-b border-neutral-200/50">
      <div className="max-w-[1400px] mx-auto px-0 sm:px-4 lg:px-10 pt-16">

        {eyebrow && (
          <div className="flex items-center gap-4 mb-7">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
              {eyebrow}
            </span>
          </div>
        )}

        <h1
          className="font-light text-[#1C1C1C] leading-[1.0] tracking-[-0.02em] mb-5"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
          }}
        >
          {title}
        </h1>

        <div className="w-10 h-px bg-[#C9A84C]" />

        {subtitle && (
          <p className="text-[13px] text-neutral-400 tracking-[0.02em] mt-5 max-w-md leading-[1.85]">
            {subtitle}
          </p>
        )}

      </div>
    </div>
  );
}

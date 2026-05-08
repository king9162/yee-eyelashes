import { cn } from "@/lib/utils";

type SectionTitleProps = {
  heading: string;
  subheading?: string;
  eyebrow?: string;        // optional — if omitted no eyebrow shown
  align?: "left" | "center" | "right";
  light?: boolean;
  className?: string;
};

export default function SectionTitle({
  heading,
  subheading,
  eyebrow,
  align = "center",
  light = false,
  className,
}: SectionTitleProps) {
  const textAlign = {
    left:   "text-left  items-start",
    center: "text-center items-center",
    right:  "text-right items-end",
  }[align];

  return (
    <div className={cn("mb-16 flex flex-col", textAlign, className)}>

      {/* Optional eyebrow */}
      {eyebrow && (
        <div className="flex items-center gap-4 mb-6">
          {align !== "right"  && <div className="w-8 h-px bg-[#C9A84C]" />}
          <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
            {eyebrow}
          </span>
          {align === "right"  && <div className="w-8 h-px bg-[#C9A84C]" />}
          {align === "center" && <div className="w-8 h-px bg-[#C9A84C]" />}
        </div>
      )}

      {/* Heading */}
      <h2
        className={cn(
          "font-light leading-[1.05] tracking-[-0.01em] mb-5",
          "text-[1.7rem] sm:text-4xl md:text-5xl lg:text-[3.4rem]",
          light ? "text-white" : "text-[#1C1C1C]"
        )}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {heading}
      </h2>

      {/* Gold rule — always shown */}
      <div
        className={cn(
          "h-px w-10 bg-[#C9A84C] mb-6",
          align === "center" && "mx-auto",
          align === "right"  && "ml-auto"
        )}
      />

      {/* Subheading */}
      {subheading && (
        <p
          className={cn(
            "text-[13px] leading-[1.9] tracking-[0.02em] md:whitespace-nowrap",
            align === "center" && "mx-auto",
            align === "right"  && "ml-auto",
            light ? "text-white/45" : "text-neutral-400"
          )}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang } from "@/i18n";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return {};
  return {
    title: "Premium Cashmere Lash Extensions Manhasset NY | Hybrid and Design Style | YEE EYELASHES",
    description: "Premium Cashmere lash extensions in Manhasset NY. Concave-base, split-tip fibers for a softer, fuller look. Classic, Hybrid and Design Style sets from $80. Book at Yee Eyelashes.",
    alternates: {
      canonical: "https://www.yeeeyelashes.com/en/premium-cashmere-lash-extensions-manhasset",
      languages: {
        en: "https://www.yeeeyelashes.com/en/premium-cashmere-lash-extensions-manhasset",
        "x-default": "https://www.yeeeyelashes.com/en/premium-cashmere-lash-extensions-manhasset",
      },
    },
    openGraph: {
      title: "Premium Cashmere Lash Extensions Manhasset NY | YEE EYELASHES",
      description: "Royal Cashmere lashes with a concave base and split tip. Fuller, softer, and more luxurious than standard extensions. From $80 in Manhasset NY.",
      url: "https://www.yeeeyelashes.com/en/premium-cashmere-lash-extensions-manhasset",
      type: "website",
      locale: "en_US",
      siteName: "Yee Eyelashes",
    },
  };
}

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yeeeyelashes.com/en" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://www.yeeeyelashes.com/en/services" },
    { "@type": "ListItem", position: 3, name: "Premium Cashmere Lash Extensions Manhasset", item: "https://www.yeeeyelashes.com/en/premium-cashmere-lash-extensions-manhasset" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Premium Cashmere Lash Extensions",
  description: "Royal Cashmere eyelash extensions with a concave base and split tip for a softer, fuller, more luxurious look. Available in Classic (60 to 140 pcs) and Design Style options. New sets from $80 in Manhasset NY.",
  provider: {
    "@type": "BeautySalon",
    name: "Yee Eyelashes",
    url: "https://www.yeeeyelashes.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "278 Plandome Rd, 2nd Floor",
      addressLocality: "Manhasset",
      addressRegion: "NY",
      postalCode: "11030",
      addressCountry: "US",
    },
    telephone: "+19298062467",
  },
  areaServed: { "@type": "City", name: "Manhasset" },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "80",
    highPrice: "170",
    priceCurrency: "USD",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are Premium Cashmere lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Premium Cashmere lash extensions at Yee Eyelashes use Royal Cashmere fibers with a distinctive concave base and split tip. The concave base allows for a more secure bond at the root, and the split tip creates a subtle fluffiness that catches light beautifully. The result is a lash set that is noticeably fuller and more polished than standard extensions, without the bulk or weight of volume fans.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Classic Cashmere and Hybrid Cashmere?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Classic Cashmere sets (60 to 120 pcs per eye) apply one Premium Cashmere extension to each natural lash for a refined, polished result. Hybrid Cashmere (140 pcs per eye) blends Classic and light volume techniques for added texture and fluffiness while still feeling natural. Hybrid is ideal for clients who want more visible lashes without committing to full 3D volume fans.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Design Style Cashmere set?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Design Style is our most customized Cashmere offering. Your lash artist hand-selects lengths, curls, and placements based on your eye shape, bone structure, and personal aesthetic. Sparkle or glitter lash accents can be added for special occasions. Design Style sets start at $130 and are a favorite for weddings, events, or anyone who wants a truly bespoke lash look.",
      },
    },
    {
      "@type": "Question",
      name: "How long do Premium Cashmere lash extensions last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Premium Cashmere lash extensions last 3 to 4 weeks with proper aftercare. The concave base creates a secure bond point that holds adhesive effectively. Refills are available at 1-week, 2-week, and 3-week intervals depending on your set size.",
      },
    },
    {
      "@type": "Question",
      name: "Is Premium Cashmere better than Real Mink?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Neither is objectively better. They suit different goals. Real Mink delivers an ultra-natural, semi-matte look that blends invisibly into your lash line. Premium Cashmere creates a softer, more dimensional result with visible fullness and a gentle sheen. If you want natural and weightless, Real Mink is the right choice. If you want noticeably fuller and more polished without volume fans, Cashmere is the upgrade. Our lash artists help you decide during your consultation.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I get Premium Cashmere lash extensions near Manhasset NY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yee Eyelashes offers Premium Cashmere lash extensions at our studio at 278 Plandome Rd, 2nd Floor, Manhasset NY 11030. We serve clients from Great Neck, Port Washington, Roslyn, Garden City, Woodbury, and clients who travel from Queens and Manhattan via the LIRR Port Washington branch.",
      },
    },
  ],
};

const pricing = [
  { label: "60 pcs", subtitle: "Natural", price: "$80", dur: "1 hr", desc: "60 Premium Cashmere extensions per eye. A refined, natural-looking enhancement with the added dimension that Cashmere's split-tip finish delivers. The softest upgrade from your natural lashes." },
  { label: "80 pcs", subtitle: "Soft Defined", price: "$100", dur: "1 hr", desc: "80 extensions per eye. Clean, polished, and effortless. The concave base creates a more pronounced root curl for a beautifully defined look that transitions easily from day to night." },
  { label: "100 pcs", subtitle: "Full Natural", price: "$120", dur: "1 hr 30 min", desc: "100 extensions per eye. A balanced, full look with visible length and soft volume. Ideal for clients who want noticeably beautiful lashes without appearing overdone." },
  { label: "120 pcs", subtitle: "Lush", price: "$130", dur: "1 hr 30 min", desc: "Our most popular Cashmere set. Lush, full, and beautifully glamorous. This is the everyday luxury lash that looks professionally done at all times." },
  { label: "140 pcs", subtitle: "Hybrid", price: "$150", dur: "1 hr 30 min", desc: "A blend of Classic and light volume technique. More texture, more fluffiness, and enhanced density. The hybrid set that bridges the gap between classic and 3D volume lashes." },
  { label: "Design Style", subtitle: "Custom", price: "$130+", dur: "Varies", desc: "A fully customized Cashmere set designed around your eye shape, lifestyle, and aesthetic. Optional sparkle and glitter lash accents available for special occasions or events." },
];

export default async function PremiumCashmerePage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang) || lang !== "en") notFound();

  const bookHref = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        eyebrow="Premium Cashmere · Luxury Lashes · Manhasset NY"
        title="Premium Cashmere Lash Extensions in Manhasset, NY"
        subtitle="Royal Cashmere fibers with a concave base and split tip. Softer, fuller, and more luxurious than standard extensions. New sets from $80."
      />

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-24">
            <div>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">What Makes Cashmere Different?</span>
              </div>
              <h2 className="text-[2rem] md:text-[2.4rem] font-light text-[#1C1C1C] leading-tight mb-6" style={{ fontFamily: "var(--font-serif)" }}>
                Engineered for Fuller, Softer Results
              </h2>
              <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
                <p>
                  Premium Cashmere lash extensions use Royal Cashmere fibers. These fibers have two design features that separate them from standard lash extension materials. First, the concave base creates a more secure bond with your natural lash and produces a softer, more natural curl at the root. Second, the split tip creates a subtle, feathery texture at the end of each fiber that catches light in a way that standard tips cannot replicate.
                </p>
                <p>
                  The result is a lash set that looks noticeably fuller and more dimensional than classic faux mink extensions without the bulk or weight of Russian volume fans. Premium Cashmere is the right choice for clients who want their lashes to make a statement while still looking and feeling genuinely natural.
                </p>
                <p>
                  At Yee Eyelashes in Manhasset NY, we apply every Cashmere extension with the same individual-isolation technique used for all our sets. No shortcuts. No stacking. The result is a full, polished lash set that grows out evenly and looks beautiful at every stage of its life cycle.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Three Ways to Wear Cashmere</span>
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: "Classic Cashmere (60 to 120 pcs)",
                    body: "One Cashmere extension per natural lash. This is the refined, everyday luxury look. Fuller and more polished than Real Mink, without any volume fans. Suitable for clients of all lash densities. Sets from $80.",
                  },
                  {
                    title: "Hybrid Cashmere (140 pcs)",
                    body: "A blend of Classic and light volume technique. Hybrid adds texture and fluffiness for a more multi-dimensional look while maintaining a natural, wearable feel. Our most requested upgrade for clients who want more visible lashes. Sets from $150.",
                  },
                  {
                    title: "Design Style Cashmere (Custom)",
                    body: "A fully bespoke Cashmere set designed around your eye shape and personal aesthetic. Perfect for weddings, events, or anyone who wants a signature lash look. Optional sparkle and glitter accents available. From $130.",
                  },
                ].map((v) => (
                  <div key={v.title} className="flex gap-6">
                    <div className="w-px bg-[#C9A84C]/30 flex-shrink-0" />
                    <div>
                      <h3 className="text-[1rem] font-light text-[#1C1C1C] mb-2" style={{ fontFamily: "var(--font-serif)" }}>{v.title}</h3>
                      <p className="text-[13px] text-neutral-400 leading-[1.85]">{v.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Premium Cashmere Pricing — New Sets</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricing.map((row) => (
                <div key={row.label} className="border border-neutral-100 p-8">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-[1rem] font-light text-[#1C1C1C] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>{row.label}</h3>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-300">{row.subtitle}</span>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="block text-[#C9A84C] text-[1rem] font-light">{row.price}</span>
                      <span className="block text-[10px] text-neutral-300 mt-0.5">{row.dur}</span>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 leading-[1.8] mt-3">{row.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-neutral-300 text-center">Refills available at 1-week, 2-week, and 3-week intervals. A 3 Times Package is also available. Ask at booking for details.</p>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Frequently Asked Questions</span>
            </div>
            <div className="space-y-8 max-w-3xl">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name}>
                  <h3 className="text-[1rem] font-light text-[#1C1C1C] mb-3" style={{ fontFamily: "var(--font-serif)" }}>{item.name}</h3>
                  <p className="text-[13px] text-neutral-400 leading-[1.85]">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-14 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
            <Link href={bookHref} target="_blank" rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.35em] bg-[#1C1C1C] text-white px-10 py-4 hover:bg-[#C9A84C] transition-colors duration-300 whitespace-nowrap">
              Book Your Appointment
            </Link>
            <Link href="/en/services"
              className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-300 whitespace-nowrap">
              View All Services
            </Link>
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
          </div>

        </div>
      </section>
    </div>
  );
}

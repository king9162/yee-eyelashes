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
    title: "Lash Extensions & Lash Bar Manhasset NY | Real Mink · Sparkle · Near NYC | YEE EYELASHES",
    description: "Yee Eyelashes — Manhasset's premier lash bar. Real Mink from $60, Premium Cashmere, Design Style sparkle lash extensions. Long Island's top studio, 25 min from Manhattan on LIRR. Book online.",
    alternates: {
      canonical: "https://www.yeeeyelashes.com/en/lash-extensions-manhasset",
      languages: {
        "en": "https://www.yeeeyelashes.com/en/lash-extensions-manhasset",
        "x-default": "https://www.yeeeyelashes.com/en/lash-extensions-manhasset",
      },
    },
    openGraph: {
      title: "Lash Bar Manhasset NY | Real Mink & Sparkle Lash Extensions | YEE EYELASHES",
      description: "Real Mink from $60, Premium Cashmere, Design Style sparkle lash extensions in Manhasset, NY. Nassau County's top-rated lash bar, 25 min from NYC.",
      url: "https://www.yeeeyelashes.com/en/lash-extensions-manhasset",
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
    { "@type": "ListItem", position: 2, name: "Lash Extensions Manhasset", item: "https://www.yeeeyelashes.com/en/lash-extensions-manhasset" },
  ],
};

const serviceList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Lash Extension Services at Yee Eyelashes Manhasset",
  description: "Lash extension services available at Yee Eyelashes lash bar in Manhasset, NY.",
  url: "https://www.yeeeyelashes.com/en/lash-extensions-manhasset",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Real Mink Lash Extensions",
        description: "Faux mink lash extensions with a semi-matte finish. Ultra-fine, featherweight fibers that mimic natural lashes. New sets from $60 at Yee Eyelashes in Manhasset, NY.",
        provider: { "@type": "BeautySalon", name: "Yee Eyelashes", url: "https://www.yeeeyelashes.com" },
        areaServed: { "@type": "City", name: "Manhasset" },
        offers: { "@type": "Offer", price: "60", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: "60" } },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Premium Cashmere Lash Extensions",
        description: "Royal Cashmere lashes with a concave base and split tip for a softer, fuller look. New sets from $80 at Yee Eyelashes in Manhasset, NY.",
        provider: { "@type": "BeautySalon", name: "Yee Eyelashes", url: "https://www.yeeeyelashes.com" },
        areaServed: { "@type": "City", name: "Manhasset" },
        offers: { "@type": "Offer", price: "80", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: "80" } },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Design Style Sparkle Lash Extensions",
        description: "Fully custom sparkle and glam lash sets engineered around your eye shape. Glitter lash options available for special occasions. Starting at $130 in Manhasset, NY.",
        provider: { "@type": "BeautySalon", name: "Yee Eyelashes", url: "https://www.yeeeyelashes.com" },
        areaServed: { "@type": "City", name: "Manhasset" },
        offers: { "@type": "Offer", price: "130", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: "130" } },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "3D Volume Lash Extensions",
        description: "Handcrafted Russian volume fans for a full, multi-dimensional lash set. The most dramatic and eye-catching lash style available at our Manhasset lash bar.",
        provider: { "@type": "BeautySalon", name: "Yee Eyelashes", url: "https://www.yeeeyelashes.com" },
        areaServed: { "@type": "City", name: "Manhasset" },
      },
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is there a lash bar in Manhasset, NY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Yee Eyelashes is Manhasset's premier lash bar, located at 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030. We offer Real Mink, Premium Cashmere, Design Style sparkle, and 3D volume lash extensions, as well as Lash Lift, Lash Tint, and permanent makeup services. We serve clients across Nassau County including Great Neck, Port Washington, Garden City, and Roslyn.",
      },
    },
    {
      "@type": "Question",
      name: "What are sparkle lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sparkle lash extensions — also called Design Style lashes or glitter lash extensions — are fully custom sets that mix textures, lengths, and curls for a glamorous, eye-catching result. At Yee Eyelashes, our Design Style sets include glitter lash options perfect for weddings, events, and special occasions. They start at $130.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Real Mink and Premium Cashmere lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Real Mink (faux mink) lash extensions have an ultra-fine, semi-matte finish that closely mimics natural lashes — they are lightweight and virtually undetectable. Premium Cashmere lashes feature a concave base and split tip that create a slightly fuller, softer appearance with more light reflection. Real Mink is ideal for natural everyday looks; Cashmere adds more dimension for those who want noticeable results without volume fans.",
      },
    },
    {
      "@type": "Question",
      name: "How long do lash extensions last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With proper aftercare, a full lash set at Yee Eyelashes typically lasts 3–4 weeks before a refill is needed. Results vary depending on your natural lash growth cycle, skincare routine, and daily habits. We provide personalized aftercare guidance at every appointment to maximize the longevity of your lash set.",
      },
    },
    {
      "@type": "Question",
      name: "How far is Yee Eyelashes from New York City?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yee Eyelashes in Manhasset, NY is approximately 25 minutes from Midtown Manhattan by Long Island Rail Road (LIRR). Many of our clients travel from Queens, Manhattan, Brooklyn, and the Bronx for appointments. We are one of the closest premium lash bars to New York City on Long Island.",
      },
    },
  ],
};

const services = [
  {
    name: "Real Mink Lash Extensions",
    price: "from $60",
    description: "Our Real Mink lash extensions use ultra-fine faux mink fibers with a semi-matte finish that closely mimics natural lashes. Featherweight and flexible, these extensions are virtually undetectable and ideal for everyday wear. A natural-looking lash set that stays full and beautiful for 3–4 weeks with proper care. Perfect for first-time clients and anyone seeking a clean, mascara-free look.",
  },
  {
    name: "Premium Cashmere Lash Extensions",
    price: "from $80",
    description: "Premium Cashmere lashes feature a concave base and a distinctive split tip that creates a softer, fuller appearance than standard extensions. Each fiber catches light beautifully, adding dimension and drama without volume fans. Cashmere is our most luxurious single-extension material — polished and refined, with results that turn heads without looking overdone.",
  },
  {
    name: "Design Style Sparkle Lash Extensions",
    price: "from $130",
    description: "Design Style is where lash artistry truly shines. These fully custom sparkle lash sets are engineered around your eye shape, bone structure, and personal aesthetic. We hand-select lengths, curls, textures, and glitter lash accents to create an eye-catching look that is uniquely yours. Whether you want subtle shimmer or full glam for a special occasion, Design Style delivers results you cannot find at a standard lash bar.",
  },
  {
    name: "3D Volume Lash Extensions",
    price: "",
    description: "3D volume lash extensions use handcrafted Russian volume fans applied to each natural lash for a full, multi-dimensional result. Volume lashes photograph beautifully, hold their shape through long days and events, and create dramatic definition without feeling heavy. Our volume sets can be combined with any of our premium materials for the ultimate custom lash experience.",
  },
];

export default async function LashExtensionsManhassetPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang) || lang !== "en") notFound();

  const bookHref = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        eyebrow="Lash Bar · Nassau County"
        title="Lash Extensions & Lash Bar in Manhasset, NY"
        subtitle="Real Mink, Premium Cashmere, Design Style sparkle lash extensions — handcrafted for your eye shape. Serving Nassau County and Long Island."
      />

      {/* Intro */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-24">
            <div>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Manhasset&apos;s Lash Bar</span>
              </div>
              <h2
                className="text-[2rem] md:text-[2.4rem] font-light text-[#1C1C1C] leading-tight mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Precision Lash Extensions, Personalized for You
              </h2>
              <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
                <p>
                  Yee Eyelashes is Manhasset&apos;s premier lash bar, located at 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030. We specialize in precision eyelash extensions using the finest materials — Real Mink, Premium Cashmere, Design Style sparkle lashes, and 3D volume lash extensions — all applied by experienced lash artists in a calm, boutique setting.
                </p>
                <p>
                  Our lash bar serves clients throughout Nassau County and Long Island, including Great Neck, Port Washington, Garden City, Roslyn, and Woodbury. We also welcome clients from Queens, Manhattan, and Brooklyn who make the short LIRR trip to experience a level of lash artistry that is difficult to find closer to the city.
                </p>
                <p>
                  Every appointment at our Manhasset lash bar begins with a thorough consultation. We study your eye shape, bone structure, and lifestyle before selecting a single extension. The result is a lash set that is uniquely yours — not a template. Whether you are looking for natural everyday lashes or eye-catching sparkle lash extensions for a wedding or event, we have the expertise and materials to deliver lasting results.
                </p>
              </div>
            </div>

            {/* Near NYC callout */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Lash Extensions Near NYC</span>
              </div>
              <p className="text-[13.5px] text-neutral-500 leading-[1.95]">
                Looking for premium lash extensions near New York City? Yee Eyelashes is approximately 25 minutes from Midtown Manhattan by Long Island Rail Road — making us one of the most accessible premium lash bars for NYC clients. Many of our clients come from Queens, Manhattan, Brooklyn, and the Bronx specifically because the quality of our work and the personalization of our approach are unlike anything they have found at city studios.
              </p>
              <p className="text-[13.5px] text-neutral-500 leading-[1.95]">
                The short LIRR ride to Manhasset is worth it. Our boutique studio offers undivided attention, cruelty-free premium materials, and results that last — not just for the day of your appointment, but for weeks.
              </p>
              <div className="border-l-2 border-[#C9A84C]/40 pl-6">
                <p className="text-[12px] text-neutral-400 leading-[1.85]">
                  <strong className="text-[#1C1C1C] font-normal">Manhasset Station</strong><br />
                  25 min from Penn Station via LIRR Port Washington Branch.<br />
                  Studio is a short walk from the station.
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Our Lash Extension Services</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((s) => (
                <div key={s.name} className="border border-neutral-100 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className="text-[1.05rem] font-light text-[#1C1C1C] leading-snug max-w-[200px]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {s.name}
                    </h3>
                    {s.price && (
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A84C] whitespace-nowrap ml-4">
                        {s.price}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-neutral-400 leading-[1.85]">{s.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/en/services"
                className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-300"
              >
                View Full Service Menu & Pricing →
              </Link>
            </div>
          </div>

          {/* Why Yee */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Why Yee Eyelashes</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Long Lasting Results",
                  body: "Precision technique and premium materials mean your lash set stays fuller for longer. We never rush. Every natural lash is individually isolated, every fan is hand-made, every curl is chosen for your specific eye anatomy.",
                },
                {
                  title: "Cruelty-Free Materials",
                  body: "All of our lash extension materials — Real Mink, Premium Cashmere, and Design Style — are cruelty-free and vegan-friendly. We use medical-grade, formaldehyde-free adhesive on every client.",
                },
                {
                  title: "Aftercare That Extends Your Lashes",
                  body: "We provide personalized aftercare guidance at every appointment. Knowing how to care for your lash set is the single biggest factor in how long your extensions last — and we make sure you leave with that knowledge.",
                },
              ].map((v) => (
                <div key={v.title} className="flex gap-6">
                  <div className="w-px bg-[#C9A84C]/30 flex-shrink-0" />
                  <div>
                    <h3
                      className="text-[1rem] font-light text-[#1C1C1C] mb-2"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {v.title}
                    </h3>
                    <p className="text-[13px] text-neutral-400 leading-[1.85]">{v.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Common Questions</span>
            </div>
            <div className="space-y-8 max-w-3xl">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name}>
                  <h3
                    className="text-[1rem] font-light text-[#1C1C1C] mb-3"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-[13px] text-neutral-400 leading-[1.85]">
                    {item.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-14 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
            <Link
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.35em] bg-[#1C1C1C] text-white px-10 py-4 hover:bg-[#C9A84C] transition-colors duration-300 whitespace-nowrap"
            >
              Book Your Appointment
            </Link>
            <Link
              href="/en/services"
              className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-300 whitespace-nowrap"
            >
              View All Services →
            </Link>
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
          </div>

        </div>
      </section>
    </div>
  );
}

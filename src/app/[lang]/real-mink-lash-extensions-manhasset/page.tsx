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
    title: "Real Mink Lash Extensions Manhasset NY | Natural Faux Mink | YEE EYELASHES",
    description: "Real Mink faux mink lash extensions in Manhasset NY. Ultra-fine, semi-matte, featherweight. New sets from $60. Expert lash artists serving Nassau County and Long Island. Book online.",
    alternates: {
      canonical: "https://www.yeeeyelashes.com/en/real-mink-lash-extensions-manhasset",
      languages: {
        en: "https://www.yeeeyelashes.com/en/real-mink-lash-extensions-manhasset",
        "x-default": "https://www.yeeeyelashes.com/en/real-mink-lash-extensions-manhasset",
      },
    },
    openGraph: {
      title: "Real Mink Lash Extensions Manhasset NY | YEE EYELASHES",
      description: "Ultra-fine faux mink lash extensions with a semi-matte finish. Natural and lightweight. New sets from $60 in Manhasset NY.",
      url: "https://www.yeeeyelashes.com/en/real-mink-lash-extensions-manhasset",
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
    { "@type": "ListItem", position: 3, name: "Real Mink Lash Extensions Manhasset", item: "https://www.yeeeyelashes.com/en/real-mink-lash-extensions-manhasset" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Real Mink Lash Extensions",
  description: "Faux mink eyelash extensions with a semi-matte finish. Ultra-fine, featherweight fibers applied individually for a natural, mascara-free look. Available in 60, 80, 100, and 120 lashes per eye. New sets from $60 at Yee Eyelashes in Manhasset NY.",
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
    lowPrice: "60",
    highPrice: "120",
    priceCurrency: "USD",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are Real Mink lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Real Mink lash extensions at Yee Eyelashes use ultra-fine faux mink fibers with a semi-matte finish that closely mimics the look and weight of natural lashes. Despite the name, they are 100% cruelty-free with no animal fur used. Each extension is applied individually to a single natural lash using medical-grade adhesive, creating a seamless, natural-looking result that lasts 3 to 4 weeks.",
      },
    },
    {
      "@type": "Question",
      name: "How many lashes come in a Real Mink set?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At Yee Eyelashes, Real Mink sets are available in four densities: 60 pcs ($60), 80 pcs ($80), 100 pcs ($100), and 120 pcs ($120) per eye. The 60 to 80 pcs sets deliver a subtle, barely-there enhancement, while the 100 to 120 pcs sets create a more defined, mascara-free look. Your lash artist will recommend the right count during your consultation.",
      },
    },
    {
      "@type": "Question",
      name: "How long do Real Mink lash extensions last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With proper aftercare, Real Mink lash extensions typically last 3 to 4 weeks before a refill is needed. Results vary depending on your natural lash growth cycle, skincare routine, and daily habits. We provide personalized aftercare guidance at every appointment. Refills are available at 1-week ($30), 2-week ($40), and 3-week ($50) intervals.",
      },
    },
    {
      "@type": "Question",
      name: "Are Real Mink lash extensions safe for sensitive eyes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. At Yee Eyelashes we use medical-grade, formaldehyde-free adhesive on every client. Real Mink faux mink fibers are lightweight and hypoallergenic, making them a comfortable choice for most clients including those with sensitive eyes. If you have a history of eye sensitivity or allergies, please mention it when booking so we can take any necessary precautions.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Real Mink and Premium Cashmere lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Real Mink lash extensions have a semi-matte finish and ultra-fine fibers that blend seamlessly with natural lashes for a barely-there look. Premium Cashmere lashes feature a concave base and a split tip that catches light and creates a softer, fuller appearance. Real Mink is ideal for a clean, natural everyday look. Cashmere adds more visible dimension for clients who want noticeable results without volume fans.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Yee Eyelashes located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yee Eyelashes is located at 278 Plandome Rd, 2nd Floor, Manhasset NY 11030, a short walk from Manhasset LIRR Station. We serve clients across Nassau County including Great Neck, Port Washington, Roslyn, Garden City, and Woodbury, as well as clients who travel from Queens, Manhattan, and Brooklyn via the Port Washington LIRR branch.",
      },
    },
  ],
};

const pricing = [
  { label: "60 pcs", subtitle: "Super Natural", price: "$60", dur: "1 hr", desc: "60 lash extensions per eye. A super natural, barely-there enhancement. Perfect for first-time clients or anyone who prefers a clean, effortless everyday look with zero maintenance." },
  { label: "80 pcs", subtitle: "Natural", price: "$80", dur: "1 hr", desc: "The most popular natural look. Soft definition and light length. It looks like naturally fuller lashes, no mascara needed. Great for clients who want a fresh, awake appearance every day." },
  { label: "100 pcs", subtitle: "Defined", price: "$100", dur: "1 hr 30 min", desc: "A balanced, polished look between natural and defined. Gentle volume and length like perfectly applied mascara, but without any smudging or daily upkeep." },
  { label: "120 pcs", subtitle: "Full", price: "$120", dur: "1 hr 30 min", desc: "Effortless, full lashes without the daily makeup effort. 120 extensions per eye create a naturally enhanced look with soft length and volume. Wake up with beautiful lashes every morning." },
];

const refills = [
  { type: "1-Week Refill", prices: ["$30", "$40", "$45", "$55"] },
  { type: "2-Week Refill", prices: ["$40", "$50", "$55", "$65"] },
  { type: "3-Week Refill", prices: ["$50", "$70", "$75", "$85"] },
];

export default async function RealMinkPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang) || lang !== "en") notFound();

  const bookHref = "/";

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        eyebrow="Real Mink · Natural Lashes · Manhasset NY"
        title="Real Mink Lash Extensions in Manhasset, NY"
        subtitle="Ultra-fine faux mink fibers with a semi-matte finish. Featherweight, natural, and individually applied. New sets from $60."
      />

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-24">
            <div>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">What Is Real Mink?</span>
              </div>
              <h2 className="text-[2rem] md:text-[2.4rem] font-light text-[#1C1C1C] leading-tight mb-6" style={{ fontFamily: "var(--font-serif)" }}>
                The Natural Choice for Lash Extensions
              </h2>
              <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
                <p>
                  Real Mink lash extensions are made from ultra-fine faux mink fibers with a semi-matte finish. They mimic the appearance and weight of your natural lashes so closely that most people cannot tell you are wearing extensions at all. Despite the name, they are 100% cruelty-free with no animal fur involved.
                </p>
                <p>
                  At Yee Eyelashes in Manhasset NY, our lash artists apply every Real Mink extension individually using a precision-isolation technique. Each fiber is bonded to a single natural lash with medical-grade, formaldehyde-free adhesive. We never stack, never rush, and never skip the consultation. The result is a set that feels as weightless as it looks.
                </p>
                <p>
                  Real Mink is our most popular choice for clients who want long-lasting, natural-looking lashes without the daily mascara routine. Whether you choose a barely-there 60-piece set or a full 120-piece look, you leave looking like you simply have beautiful lashes. Nothing more, nothing less.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Why Clients Choose Real Mink</span>
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: "Featherweight Feel",
                    body: "Real Mink fibers are among the lightest lash extension materials available. Clients often describe forgetting they are even wearing extensions. That kind of comfort is only possible when both the technique and material quality are dialed in.",
                  },
                  {
                    title: "Semi-Matte Finish",
                    body: "The matte finish of Real Mink fibers reflects light softly rather than creating a glossy effect. The result looks genuinely natural in all lighting conditions, from bright afternoon sun to evening settings.",
                  },
                  {
                    title: "Long-Lasting Results",
                    body: "A properly applied Real Mink set at Yee Eyelashes lasts 3 to 4 weeks before a refill is needed. With the aftercare routine we share at every appointment, many clients stretch their sets even further.",
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
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Real Mink Pricing — New Sets</span>
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

            <div className="mt-8 border border-neutral-100 p-8">
              <h3 className="text-[1rem] font-light text-[#1C1C1C] mb-6" style={{ fontFamily: "var(--font-serif)" }}>Refill Pricing</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] text-neutral-500">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left pb-3 font-normal text-[#1C1C1C]">Refill</th>
                      <th className="text-center pb-3 font-normal text-neutral-400">60 pcs</th>
                      <th className="text-center pb-3 font-normal text-neutral-400">80 pcs</th>
                      <th className="text-center pb-3 font-normal text-neutral-400">100 pcs</th>
                      <th className="text-center pb-3 font-normal text-neutral-400">120 pcs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {refills.map((r) => (
                      <tr key={r.type}>
                        <td className="py-3 text-[#1C1C1C]">{r.type}</td>
                        {r.prices.map((p, i) => (
                          <td key={i} className="py-3 text-center text-[#C9A84C]">{p}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[11px] text-neutral-300">A 3 Times Package is also available. Ask at booking for details.</p>
            </div>
          </div>

          {/* What to expect */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">What to Expect at Your Appointment</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Consultation",
                  body: "Every Real Mink appointment starts with a personalized consultation. We look at your natural lash health, eye shape, and lifestyle to recommend the right pcs count, curl, and length for you.",
                },
                {
                  step: "02",
                  title: "Application",
                  body: "Using individual isolation, each Real Mink extension is bonded to one natural lash. We never rush this process. Depending on the set, application takes 1 to 1.5 hours. Clients are welcome to rest or nap.",
                },
                {
                  step: "03",
                  title: "Aftercare Guidance",
                  body: "Before you leave, your lash artist walks you through a complete aftercare routine. Proper aftercare is the single biggest factor in how long your set lasts, and we make sure you leave with everything you need to know.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <span className="text-[10px] text-[#C9A84C] tracking-[0.3em]">{s.step}</span>
                  </div>
                  <div>
                    <h3 className="text-[1rem] font-light text-[#1C1C1C] mb-2" style={{ fontFamily: "var(--font-serif)" }}>{s.title}</h3>
                    <p className="text-[13px] text-neutral-400 leading-[1.85]">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
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

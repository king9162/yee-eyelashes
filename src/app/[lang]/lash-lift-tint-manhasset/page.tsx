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
    title: "Lash Lift and Tint Manhasset NY | Eyelash Lift Near Me | YEE EYELASHES",
    description: "Lash lift and tint in Manhasset NY. Lift your natural lashes for a curled, wide-eye look without extensions. Eyelash lift $79, tint $20. Book at Yee Eyelashes, Nassau County.",
    alternates: {
      canonical: "https://www.yeeeyelashes.com/en/lash-lift-tint-manhasset",
      languages: {
        en: "https://www.yeeeyelashes.com/en/lash-lift-tint-manhasset",
        "x-default": "https://www.yeeeyelashes.com/en/lash-lift-tint-manhasset",
      },
    },
    openGraph: {
      title: "Lash Lift and Tint Manhasset NY | YEE EYELASHES",
      description: "Eyelash lift and tint services in Manhasset NY. Natural lash curl that lasts 6 to 8 weeks. No extensions required. Book online at Yee Eyelashes.",
      url: "https://www.yeeeyelashes.com/en/lash-lift-tint-manhasset",
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
    { "@type": "ListItem", position: 3, name: "Lash Lift and Tint Manhasset", item: "https://www.yeeeyelashes.com/en/lash-lift-tint-manhasset" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Lash Lift and Tint Services at Yee Eyelashes Manhasset NY",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Eyelash Lift",
        description: "A semi-permanent treatment that curls and lifts your natural lashes from the root. Results last 6 to 8 weeks. $79 at Yee Eyelashes in Manhasset NY.",
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
        offers: { "@type": "Offer", price: "79", priceCurrency: "USD" },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Eyelash Tinting",
        description: "Semi-permanent dye applied to natural lashes for deeper color and more defined look. $20 at Yee Eyelashes in Manhasset NY.",
        provider: {
          "@type": "BeautySalon",
          name: "Yee Eyelashes",
          url: "https://www.yeeeyelashes.com",
        },
        areaServed: { "@type": "City", name: "Manhasset" },
        offers: { "@type": "Offer", price: "20", priceCurrency: "USD" },
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
      name: "What is a lash lift?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A lash lift is a semi-permanent treatment that curls and lifts your natural lashes from the root, creating the appearance of longer, wider, more defined eyes without any extensions. At Yee Eyelashes in Manhasset NY, our eyelash lift service takes approximately 45 minutes and the results last 6 to 8 weeks. It is one of the lowest-maintenance beauty treatments you can do.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a lash lift cost in Manhasset NY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At Yee Eyelashes, an eyelash lift is $79 and takes approximately 45 minutes. Eyelash tinting is $20 and takes 20 minutes. Most clients book both together for a combined total of $99. This gives you curled, darkened, beautifully defined natural lashes that last 6 to 8 weeks with zero daily maintenance.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a lash lift last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A lash lift at Yee Eyelashes typically lasts 6 to 8 weeks, depending on your natural lash growth cycle. As your lashes naturally shed and regrow, the lift gradually grows out. Most clients come in every 6 to 8 weeks to maintain their results. There is no special aftercare required after the first 24 hours.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a lash lift and lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lash extensions add individual fibers to your natural lashes for more length, volume, and density. A lash lift works only with your natural lashes, curling and lifting them to appear longer and more defined. Extensions require more upkeep (refills every 2 to 3 weeks). A lash lift is simpler, lower cost, and lower maintenance, making it a great option for clients who want beautiful lashes without the commitment of extensions.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get a lash lift and tint at the same appointment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We recommend combining both services in the same appointment. The lash lift curls and opens up your lashes, and the tint darkens them so they appear even more defined and prominent. Together, the two services take about 1 hour and cost $99. The combined result looks like you have naturally long, dark, curled lashes with no mascara needed.",
      },
    },
    {
      "@type": "Question",
      name: "Is a lash lift safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, lash lifts are safe when performed by a trained technician using quality products. At Yee Eyelashes, we use gentle, professional-grade solutions and follow a careful process to protect your natural lashes throughout the treatment. If you have very short or sparse natural lashes, your lash artist will let you know whether a lift is appropriate for you during your consultation.",
      },
    },
  ],
};

export default async function LashLiftPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang) || lang !== "en") notFound();

  const bookHref = "/";

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        eyebrow="Lash Lift and Tint · Manhasset NY"
        title="Lash Lift and Tint in Manhasset, NY"
        subtitle="A semi-permanent curl for your natural lashes. No extensions, no daily maintenance. Results last 6 to 8 weeks. Eyelash lift $79, tint $20."
      />

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-24">
            <div>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">What Is a Lash Lift?</span>
              </div>
              <h2 className="text-[2rem] md:text-[2.4rem] font-light text-[#1C1C1C] leading-tight mb-6" style={{ fontFamily: "var(--font-serif)" }}>
                Beautiful Lashes Using Only What You Have
              </h2>
              <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
                <p>
                  A lash lift is a semi-permanent treatment that works with your own natural lashes, curling and lifting them from the root to create the appearance of longer, more defined eyes. No extensions are added. Nothing is attached to your lashes. The treatment simply enhances the shape and direction of the lashes you already have.
                </p>
                <p>
                  At Yee Eyelashes in Manhasset NY, our eyelash lift service takes about 45 minutes. We place your natural lashes over a silicone rod and apply a gentle lifting solution that sets the curl in place. Once processed and neutralized, your lashes hold the new shape for 6 to 8 weeks as the growth cycle naturally refreshes them.
                </p>
                <p>
                  For clients who want even more definition, we recommend pairing the lift with an eyelash tint ($20). The tint darkens your lashes to their maximum natural color, making them appear thicker and more prominent. Most clients walk out looking like they have the most beautiful natural lashes they have ever had, with zero effort required to maintain them.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Why Clients Love the Lash Lift</span>
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: "Zero Daily Maintenance",
                    body: "Once the first 24 hours have passed, there is nothing to maintain. You can shower, swim, sweat, and sleep completely normally. Your lashes stay curled and beautiful without any routine upkeep.",
                  },
                  {
                    title: "Perfect for Extension Breaks",
                    body: "Many of our extension clients book a lash lift between sets to give their natural lashes a rest. The lift keeps them looking great while their natural lashes recover their full strength and length.",
                  },
                  {
                    title: "Great for All Lash Types",
                    body: "Lash lifts work especially well for clients with straight, downward-pointing, or stubborn lashes that resist a natural curl. If your lashes have always fallen flat no matter what mascara or curler you use, a lash lift changes everything.",
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
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Lash Lift and Tint Pricing</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Eyelash Lift",
                  price: "$79",
                  dur: "45 min",
                  desc: "A semi-permanent curl applied to your natural lashes from the root. Lifts and opens the eyes for a wide-awake, defined look that lasts 6 to 8 weeks without any daily maintenance.",
                },
                {
                  name: "Eyelash Tinting",
                  price: "$20",
                  dur: "20 min",
                  desc: "Semi-permanent dye applied to your natural lashes to deepen their color. Makes lashes appear thicker, more defined, and more prominent. Best paired with a lash lift for the full effect.",
                },
                {
                  name: "Lift and Tint Combo",
                  price: "$99",
                  dur: "1 hr",
                  desc: "Our most popular combination. The lift curls and opens your lashes. The tint darkens and defines them. Together, they create naturally beautiful lashes that need nothing added. Recommended for almost all clients.",
                },
              ].map((row) => (
                <div key={row.name} className="border border-neutral-100 p-8">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[1rem] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-serif)" }}>{row.name}</h3>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="block text-[#C9A84C] text-[1rem] font-light">{row.price}</span>
                      <span className="block text-[10px] text-neutral-300 mt-0.5">{row.dur}</span>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 leading-[1.8] mt-3">{row.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-neutral-300 text-center">Eyebrow tinting is also available for $30 / 20 min. Ask about combining brow and lash tinting in one visit.</p>
          </div>

          {/* What to expect */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">What to Expect</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Consultation", body: "We assess your natural lash length, curl, and condition to determine the right rod size and processing time for your lift." },
                { step: "02", title: "Lift Application", body: "Your natural lashes are placed over a silicone rod and a gentle lifting solution is applied to set the new curl direction. This takes about 15 to 20 minutes." },
                { step: "03", title: "Neutralizing", body: "A neutralizer is applied to lock the curl in place. Your lashes are gently cleaned and separated. If you booked a tint, it is applied at this stage." },
                { step: "04", title: "Results", body: "You leave with curled, lifted, beautifully defined natural lashes. After 24 hours, you can treat them completely normally. No special products or routines required." },
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

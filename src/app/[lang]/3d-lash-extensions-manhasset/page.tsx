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
    title: "3D Volume Lash Extensions Manhasset NY | Russian Volume Lashes | YEE EYELASHES",
    description: "3D volume lash extensions in Manhasset NY. Handcrafted Russian volume fans for a full, dramatic look. Available in Real Mink and Premium Cashmere. Sets from $150. Book at Yee Eyelashes.",
    alternates: {
      canonical: "https://www.yeeeyelashes.com/en/3d-lash-extensions-manhasset",
      languages: {
        en: "https://www.yeeeyelashes.com/en/3d-lash-extensions-manhasset",
        "x-default": "https://www.yeeeyelashes.com/en/3d-lash-extensions-manhasset",
      },
    },
    openGraph: {
      title: "3D Volume Lash Extensions Manhasset NY | YEE EYELASHES",
      description: "Handcrafted Russian volume fans for full, dramatic lashes. Real Mink and Premium Cashmere options. Sets from $150 in Manhasset NY.",
      url: "https://www.yeeeyelashes.com/en/3d-lash-extensions-manhasset",
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
    { "@type": "ListItem", position: 3, name: "3D Volume Lash Extensions Manhasset", item: "https://www.yeeeyelashes.com/en/3d-lash-extensions-manhasset" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "3D Volume Lash Extensions",
  description: "Handcrafted Russian volume lash extensions with multiple ultra-fine fans applied per natural lash. Available in 140 and 180 lashes per eye in Real Mink and Premium Cashmere. New sets from $150 at Yee Eyelashes in Manhasset NY.",
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
    lowPrice: "150",
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
      name: "What are 3D volume lash extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "3D volume lash extensions use Russian volume technique, where multiple ultra-fine lash fibers are hand-fanned and applied to each natural lash as a single fan unit. The result is a full, multi-layered, dramatically beautiful set that is impossible to achieve with classic single-lash extensions. At Yee Eyelashes in Manhasset NY, we offer 3D lashes in both 140 and 180 lash counts per eye.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between 140 pcs and 180 pcs 3D lashes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 140 pcs set (from $150) uses a slightly lighter fan application for a full, glamorous look that still feels comfortable and natural for daily wear. The 180 pcs set (from $160) is our most dramatic option, with denser fan placement for maximum volume and depth. Both options look stunning and photograph beautifully. Your lash artist will help you choose based on your natural lash count and the look you want.",
      },
    },
    {
      "@type": "Question",
      name: "Do 3D volume lashes damage natural lashes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When applied correctly, 3D volume lashes do not damage natural lashes. The fans we use are crafted from ultra-fine fibers that are lighter than single classic extensions, so the weight per natural lash is actually comparable or less. At Yee Eyelashes, we assess your natural lash health before every appointment and only apply fans that are appropriate for the strength and density of your lashes.",
      },
    },
    {
      "@type": "Question",
      name: "How long do 3D volume lash extensions last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With proper aftercare, 3D volume lash extensions last 3 to 4 weeks. Refills are available at 1-week ($80 for 140 pcs / $90 for 180 pcs), 2-week ($90 / $105), and 3-week ($110 / $125) intervals. We also offer a 3 Times Package for clients who want to book their refills in advance at a bundled rate.",
      },
    },
    {
      "@type": "Question",
      name: "Can I choose between Real Mink and Premium Cashmere for 3D lashes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. At Yee Eyelashes, our 3D volume sets are available in both Real Mink and Premium Cashmere materials. Real Mink fans produce a soft, matte finish with a natural look. Premium Cashmere fans catch light slightly differently and add a touch more texture and dimension. Both options are made with ultra-fine fibers suitable for volume fanning. Your lash artist can walk you through the difference at your consultation.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I get 3D volume lash extensions near Manhasset NY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yee Eyelashes is located at 278 Plandome Rd, 2nd Floor, Manhasset NY 11030. We offer 3D volume lash extensions to clients across Nassau County including Great Neck, Port Washington, Roslyn, Garden City, and Woodbury. We are also a short LIRR ride from Queens and Manhattan via the Port Washington branch.",
      },
    },
  ],
};

const newSets = [
  {
    material: "Real Mink",
    rows: [
      { pcs: "140 pcs", price: "$150", dur: "1 hr 30 min", desc: "Full, fluffy volume lashes with a soft matte finish. A dramatic look that remains comfortable throughout the day. Ideal for clients who love bold lashes but prefer a natural-feeling material." },
      { pcs: "180 pcs", price: "$160", dur: "2 hr", desc: "Maximum density with ultra-fine Real Mink fans. The most dramatic lash set in our menu. Photographs beautifully and holds its shape through long events, weddings, and full days." },
    ],
  },
  {
    material: "Premium Cashmere",
    rows: [
      { pcs: "140 pcs", price: "$150", dur: "1 hr 30 min", desc: "Premium Cashmere fans for a slightly softer, more textured volume look. The split-tip fibers add a unique dimension that makes the fans appear even more full without extra weight." },
      { pcs: "180 pcs", price: "$170", dur: "2 hr", desc: "Our most luxurious volume option. 180 Premium Cashmere fans per eye for a dramatically full, polished set that stands out in any room. The ultimate upgrade for special occasions." },
    ],
  },
];

export default async function ThreeDLashPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang) || lang !== "en") notFound();

  const bookHref = "/";

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        eyebrow="3D Volume Lashes · Manhasset NY"
        title="3D Volume Lash Extensions in Manhasset, NY"
        subtitle="Handcrafted Russian volume fans for a full, multi-layered, dramatically beautiful look. Available in Real Mink and Premium Cashmere. New sets from $150."
      />

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-24">
            <div>
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">What Are 3D Volume Lashes?</span>
              </div>
              <h2 className="text-[2rem] md:text-[2.4rem] font-light text-[#1C1C1C] leading-tight mb-6" style={{ fontFamily: "var(--font-serif)" }}>
                Full, Dramatic Lashes Built by Hand
              </h2>
              <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
                <p>
                  3D volume lash extensions use the Russian volume technique. Instead of placing one extension on each natural lash, we hand-craft small fans of multiple ultra-fine fibers and apply each fan to a single natural lash. The result is a layer of lashes that looks full, fluffy, and dramatically beautiful in a way that classic single-lash extensions simply cannot achieve.
                </p>
                <p>
                  Despite how full they look, 3D volume lashes are not heavy. The fans are made from the finest, lightest fibers available. When the technique is done correctly, the total weight on each natural lash is comparable to a single classic extension. That is what makes volume lashes so impressive: maximum visual impact with minimal burden on your natural lashes.
                </p>
                <p>
                  At Yee Eyelashes in Manhasset NY, every volume fan is hand-made during your appointment. We do not use pre-made fans. Your lash artist builds each fan individually to match the natural lash it will be placed on, ensuring perfect symmetry, even distribution, and a set that holds its shape beautifully as your natural lashes grow out.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-8 h-px bg-[#C9A84C]" />
                <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">Why Clients Love 3D Lashes</span>
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: "Dramatic Results, Comfortable Wear",
                    body: "Volume fans are crafted from ultra-fine fibers that weigh less than standard classic extensions. Most clients are surprised at how light their 3D set feels, even at the 180 pcs density. Comfort and drama at the same time.",
                  },
                  {
                    title: "Photos and Events",
                    body: "3D volume lashes photograph exceptionally well. The layered depth and fullness show up clearly in photos, making them a favorite for weddings, photoshoots, birthdays, and any event where you want to look your absolute best.",
                  },
                  {
                    title: "Long-Lasting Shape",
                    body: "Because multiple fans are distributed across your natural lashes, 3D sets grow out more evenly than classic sets. The shape holds well through the refill cycle, so you stay looking great right up to your next appointment.",
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
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">3D Volume Pricing — New Sets</span>
            </div>
            <div className="space-y-8">
              {newSets.map((group) => (
                <div key={group.material}>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 mb-4">{group.material}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {group.rows.map((row) => (
                      <div key={row.pcs} className="border border-neutral-100 p-8">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-[1rem] font-light text-[#1C1C1C]" style={{ fontFamily: "var(--font-serif)" }}>{row.pcs}</h3>
                          <div className="text-right ml-4 flex-shrink-0">
                            <span className="block text-[#C9A84C] text-[1rem] font-light">{row.price}</span>
                            <span className="block text-[10px] text-neutral-300 mt-0.5">{row.dur}</span>
                          </div>
                        </div>
                        <p className="text-[12.5px] text-neutral-400 leading-[1.8] mt-3">{row.desc}</p>
                      </div>
                    ))}
                  </div>
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
                      <th className="text-center pb-3 font-normal text-neutral-400">140 pcs</th>
                      <th className="text-center pb-3 font-normal text-neutral-400">180 pcs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {[
                      { type: "1-Week Refill", prices: ["$80", "$90"] },
                      { type: "2-Week Refill", prices: ["$90", "$105"] },
                      { type: "3-Week Refill", prices: ["$110", "$125"] },
                    ].map((r) => (
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
              <p className="mt-4 text-[11px] text-neutral-300">A 3 Times Package is also available for 3D lashes. Ask at booking for details.</p>
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

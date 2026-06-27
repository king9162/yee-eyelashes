"use client";

const BASE = "https://www.yeeeyelashes.com";

const seoPages = [
  {
    category: "Location Pages",
    pages: [
      {
        title: "Lash Extensions & Lash Bar — Manhasset",
        url: `${BASE}/en/lash-extensions-manhasset`,
        desc: "Main geo landing page. Covers all extension types + near NYC / LIRR angle.",
        keywords: "lash extensions manhasset, lash bar manhasset, lash extensions near NYC",
      },
    ],
  },
  {
    category: "Service-Specific Pages",
    pages: [
      {
        title: "Real Mink Lash Extensions — Manhasset",
        url: `${BASE}/en/real-mink-lash-extensions-manhasset`,
        desc: "Targets natural faux mink extension searches. Pricing from $60 to $120. Full refill table.",
        keywords: "real mink lash extensions manhasset, faux mink lashes Long Island",
      },
      {
        title: "Premium Cashmere Lash Extensions — Manhasset",
        url: `${BASE}/en/premium-cashmere-lash-extensions-manhasset`,
        desc: "Targets luxury / cashmere extension searches. Covers Classic, Hybrid (140 pcs) and Design Style.",
        keywords: "premium cashmere lash extensions manhasset, hybrid lash extensions NY",
      },
      {
        title: "3D Volume Lash Extensions — Manhasset",
        url: `${BASE}/en/3d-lash-extensions-manhasset`,
        desc: "Targets Russian volume and 3D lash searches. 140 and 180 pcs options in Real Mink and Cashmere.",
        keywords: "3D volume lash extensions manhasset, Russian volume lashes Long Island",
      },
      {
        title: "Lash Lift and Tint — Manhasset",
        url: `${BASE}/en/lash-lift-tint-manhasset`,
        desc: "Targets lash lift and keratin lash lift searches. Lift $79, Tint $20, Combo $99.",
        keywords: "lash lift manhasset, lash lift and tint Long Island, eyelash lift near me",
      },
    ],
  },
  {
    category: "Educational / Trust Pages",
    pages: [
      {
        title: "Lash Health & Safety",
        url: `${BASE}/en/lash-health-safety`,
        desc: "Informational page covering safe lash extension practices and aftercare.",
        keywords: "lash extensions safety, eyelash extension aftercare, are lash extensions safe",
      },
    ],
  },
];

export default function SEOPagesView() {
  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-neutral-800 mb-2">SEO Pages</h1>
        <p className="text-sm text-neutral-400">
          Hidden landing pages indexed by Google but not linked in the main navigation. Do not share these URLs publicly — they are for search engine discovery only.
        </p>
      </div>

      <div className="space-y-10">
        {seoPages.map((group) => (
          <div key={group.category}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 mb-4">{group.category}</p>
            <div className="space-y-3">
              {group.pages.map((page) => (
                <div key={page.url} className="border border-neutral-100 rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 mb-1">{page.title}</p>
                      <p className="text-xs text-neutral-400 mb-2 leading-relaxed">{page.desc}</p>
                      <p className="text-[11px] text-neutral-300 italic">{page.keywords}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded hover:border-neutral-400 hover:text-neutral-800 transition-colors whitespace-nowrap"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(page.url)}
                        className="text-[11px] px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 transition-colors whitespace-nowrap"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-50">
                    <span className="text-[10px] text-neutral-300 font-mono break-all">{page.url}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-4 bg-amber-50 border border-amber-100 rounded-lg">
        <p className="text-xs text-amber-700 font-medium mb-1">How these pages work</p>
        <p className="text-xs text-amber-600 leading-relaxed">
          Each page targets a specific search term (e.g. &quot;lash lift Manhasset&quot;) and is included in the sitemap so Google can index it. They are not linked from the header or footer, so regular website visitors will only land on them from a Google search. This is a standard SEO strategy used by the top-ranked competitors.
        </p>
      </div>
    </div>
  );
}

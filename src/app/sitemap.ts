import type { MetadataRoute } from "next";

const BASE_URL = "https://www.yeeeyelashes.com";
const langs = ["en", "zh"] as const;
const pages = ["", "/services", "/about", "/faq", "/coupon", "/gallery", "/contact"] as const;

const priorities: Record<string, number> = {
  "": 1.0,
  "/services": 0.9,
  "/faq": 0.85,
  "/about": 0.8,
  "/contact": 0.8,
  "/coupon": 0.75,
  "/gallery": 0.7,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of langs) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: priorities[page] ?? 0.7,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${page}`,
            "zh-TW": `${BASE_URL}/zh${page}`,
          },
        },
      });
    }
  }

  return entries;
}

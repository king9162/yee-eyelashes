import type { MetadataRoute } from "next";

const BASE_URL = "https://yeeeyelashes.com";
const langs = ["en", "zh"] as const;
const pages = ["", "/services", "/gallery", "/booking", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of langs) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page === "/services" ? 0.9 : 0.8,
      });
    }
  }

  return entries;
}

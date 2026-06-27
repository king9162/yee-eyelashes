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
  "/lash-extensions-manhasset": 0.85,
  "/lash-health-safety": 0.85,
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

  // English-only landing pages
  entries.push({
    url: `${BASE_URL}/en/lash-health-safety`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: priorities["/lash-health-safety"],
    alternates: {
      languages: {
        en: `${BASE_URL}/en/lash-health-safety`,
        "zh-TW": `${BASE_URL}/zh/lash-health-safety`,
        "x-default": `${BASE_URL}/en/lash-health-safety`,
      },
    },
  });

  entries.push({
    url: `${BASE_URL}/zh/lash-health-safety`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: priorities["/lash-health-safety"],
    alternates: {
      languages: {
        en: `${BASE_URL}/en/lash-health-safety`,
        "zh-TW": `${BASE_URL}/zh/lash-health-safety`,
        "x-default": `${BASE_URL}/en/lash-health-safety`,
      },
    },
  });

  entries.push({
    url: `${BASE_URL}/en/lash-extensions-manhasset`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: priorities["/lash-extensions-manhasset"],
    alternates: {
      languages: {
        en: `${BASE_URL}/en/lash-extensions-manhasset`,
        "x-default": `${BASE_URL}/en/lash-extensions-manhasset`,
      },
    },
  });

  // Service-specific SEO landing pages (English only, not in navigation)
  for (const slug of [
    "real-mink-lash-extensions-manhasset",
    "premium-cashmere-lash-extensions-manhasset",
    "3d-lash-extensions-manhasset",
    "lash-lift-tint-manhasset",
  ]) {
    entries.push({
      url: `${BASE_URL}/en/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/${slug}`,
          "x-default": `${BASE_URL}/en/${slug}`,
        },
      },
    });
  }

  return entries;
}

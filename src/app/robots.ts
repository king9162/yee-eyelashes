import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/en/booking", "/zh/booking", "/en/cancel", "/zh/cancel"],
      },
    ],
    sitemap: "https://www.yeeeyelashes.com/sitemap.xml",
  };
}

import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
  description:
    "Yee Eyelashes — Manhasset's premier lash studio. Classic, hybrid, volume & mega-volume extensions. 278 Plandome Rd, NY. Serving Nassau County & Long Island.",
  keywords: [
    "eyelash extensions Manhasset",
    "lash extensions Manhasset NY",
    "lash studio Manhasset",
    "eyelash extensions Nassau County",
    "lash extensions Long Island",
    "luxury lash extensions Manhasset",
    "volume lash extensions Manhasset",
    "hybrid lash extensions Nassau County",
    "classic lash extensions Manhasset",
    "lash lift Manhasset",
    "best lash studio Nassau County",
    "eyelash extensions near me Manhasset",
    "lash extensions Great Neck",
    "lash extensions Port Washington",
    "premium eyelash extensions Long Island",
    "睫毛嫁接 紐約",
    "睫毛工作室 長島",
    "Yee Eyelashes",
  ],
  openGraph: {
    title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
    description:
      "Bespoke lash extensions designed for the discerning woman. Classic, hybrid, volume & mega-volume sets — handcrafted in Manhasset, NY. Serving Nassau County.",
    url: "https://yeeeyelashes.com",
    type: "website",
    locale: "en_US",
    siteName: "Yee Eyelashes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://yeeeyelashes.com",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "Yee Eyelashes",
  image: "https://yeeeyelashes.com/images/yee-logo-v1-cropped.png",
  description:
    "Manhasset's premier lash studio specializing in bespoke classic, hybrid, volume, and mega-volume eyelash extensions. Serving Nassau County, Long Island.",
  url: "https://yeeeyelashes.com",
  telephone: "+1-929-806-2467",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "278 Plandome Rd 2FL",
    addressLocality: "Manhasset",
    addressRegion: "NY",
    postalCode: "11030",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.7876,
    longitude: -73.6968,
  },
  sameAs: [
    "https://www.instagram.com/yee_lashesny",
    "https://www.tiktok.com/@yee_lashesny",
    "https://xhslink.com/m/1rt7w6tuczU",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Lash Extension Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Classic Lash Extensions" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hybrid Lash Extensions" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Volume Lash Extensions" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lash Lift & Tint" } },
    ],
  },
  servesCuisine: undefined,
  areaServed: [
    { "@type": "City", name: "Manhasset" },
    { "@type": "City", name: "Great Neck" },
    { "@type": "City", name: "Port Washington" },
    { "@type": "City", name: "Garden City" },
    { "@type": "AdministrativeArea", name: "Nassau County" },
    { "@type": "AdministrativeArea", name: "Long Island" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable}`}
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-screen bg-white text-black antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RecoveryRedirect from "@/components/ui/RecoveryRedirect";

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
    "Yee Eyelashes is Manhasset's premier lash studio, specializing in Real Mink, Premium Cashmere, and 3D volume eyelash extensions, Lash Lift, plus permanent makeup services. Located at 278 Plandome Rd, 2nd Floor, Manhasset, NY. Serving Nassau County and Long Island.",
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
      "Real Mink, Premium Cashmere & 3D volume lash extensions, handcrafted for your eye shape in Manhasset, NY. Serving Nassau County and Long Island.",
    url: "https://www.yeeeyelashes.com",
    type: "website",
    locale: "en_US",
    siteName: "Yee Eyelashes",
    images: [
      {
        url: "https://www.yeeeyelashes.com/api/og",
        width: 1200,
        height: 630,
        alt: "Yee Eyelashes — Premier Lash Studio in Manhasset, NY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YEE EYELASHES | Luxury Lash Extensions in Manhasset, NY",
    description: "Real Mink, Premium Cashmere & 3D volume lash extensions in Manhasset, NY. Serving Nassau County and Long Island.",
    images: ["https://www.yeeeyelashes.com/api/og"],
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
    canonical: "https://www.yeeeyelashes.com",
  },
  verification: {
    google: ["LSwZX0AAhnl4cVXf2RzQizx218bqqynmg9lMFI7lkdM", "hsa8N7MsJ33w6jFfl8R2W8XNaPyrK8VAaaNhH0iD5MQ"],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "Yee Eyelashes",
  image: "https://www.yeeeyelashes.com/images/yee-logo-v1-cropped.png",
  description:
    "Yee Eyelashes is Manhasset's premier lash bar and studio, specializing in Real Mink, Premium Cashmere, Design Style sparkle lashes, and 3D volume eyelash extensions, plus permanent makeup services. Located at 278 Plandome Rd, 2nd Floor, Manhasset, NY — serving Nassau County and Long Island.",
  url: "https://www.yeeeyelashes.com",
  telephone: "+1-516-984-3859",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "278 Plandome Rd, 2nd Floor",
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "19:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/yee_lashesny",
    "https://www.tiktok.com/@yee_lashesny",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Lash Extension Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Real Mink Lash Extensions", description: "Classic faux mink lash extensions, semi-matte finish, starting at $60" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Premium Cashmere Lash Extensions", description: "Luxury royal cashmere lash extensions with split tip, starting at $80" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "3D Volume Lash Extensions", description: "Multi-layered volume lashes for a full dramatic look, starting at $160" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Refills and Care for Lashes", description: "1-week, 2-week, and 3-week lash extension refills and care for lashes starting at $30" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Microblading", description: "Semi-permanent eyebrow microblading, starting at $599" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ombre Powder Brows", description: "Soft powder brow permanent makeup, starting at $599" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nano Hairstroke Brows", description: "Ultra-fine nano hairstroke brow technique, starting at $599" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Classic Eyeliner", description: "Permanent makeup classic eyeliner, starting at $380" } },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "61",
    bestRating: "5",
    worstRating: "1",
  },
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
      suppressHydrationWarning
      className={`${cormorant.variable} ${montserrat.variable}`}
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Yee Eyelashes",
            url: "https://www.yeeeyelashes.com",
            description: "Premier lash extension and permanent makeup studio in Manhasset, NY. Serving Nassau County and Long Island.",
            inLanguage: ["en", "zh-TW"],
            publisher: {
              "@type": "Organization",
              name: "Yee Eyelashes",
              url: "https://www.yeeeyelashes.com",
              logo: "https://www.yeeeyelashes.com/images/yee-logo-v1-cropped.png",
              sameAs: [
                "https://www.instagram.com/yee_lashesny",
                "https://www.tiktok.com/@yee_lashesny",
              ],
            },
          }) }}
        />
      </head>
      <body className="min-h-screen bg-white text-black antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T36QPXDS"
            height="0" width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-T36QPXDS');
        `}</Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-V65FBEY2NK" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V65FBEY2NK');
          gtag('config', 'AW-18136114188');
        `}</Script>
        <RecoveryRedirect />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Yee Admin",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Yee Admin",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1C1C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

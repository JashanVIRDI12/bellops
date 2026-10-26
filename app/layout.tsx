import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { SpeedInsights } from "@/components/analytics/SpeedInsights";
import { site } from "@/lib/content";
import { shareMetadata, siteTitle, siteUrl } from "@/lib/seo";
import "./globals.css";
import "./studio.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: site.name,
  title: {
    default: siteTitle,
    template: "%s · Bellops",
  },
  description: site.description,
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  category: "design",
  ...shareMetadata({ title: siteTitle, description: site.description }),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="text-ink font-sans antialiased">
        {children}
        <GoogleAnalytics />
        <MetaPixel />
        <SpeedInsights />
      </body>
    </html>
  );
}

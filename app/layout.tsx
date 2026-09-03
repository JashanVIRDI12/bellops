import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SmoothScrollProvider } from "@/components/animations/smooth-scroll-provider";
import "./globals.css";

/**
 * Single-family system, matching the PUSHWebb deck: one heavy, slightly
 * expanded grotesque for statements and the same face at lighter weights for
 * copy. The `wdth` axis is loaded so display type can widen without a
 * second family.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pushwebb.com"),
  title: "PUSHWebb — Content. Creative. Performance. AI.",
  description:
    "PUSHWebb is a creative and AI-powered marketing agency helping brands and creators grow through YouTube, short-form content, performance campaigns, and intelligent automation.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "PUSHWebb",
    title: "PUSHWebb — Content. Creative. Performance. AI.",
    description:
      "We turn content into business growth through creative strategy, performance marketing, and AI-powered systems.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PUSHWebb — We Turn Content into Business Growth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PUSHWebb — Content. Creative. Performance. AI.",
    description:
      "We turn content into business growth through creative strategy, performance marketing, and AI-powered systems.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* The app must render INSIDE this provider: GsapScrollProvider reads the
            Lenis instance off its context to drive Lenis's rAF and to keep
            ScrollTrigger in sync. As a sibling, that context never reached the
            pages and scrolling stalled. */}
        <SmoothScrollProvider>
          <AppProviders>{children}</AppProviders>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

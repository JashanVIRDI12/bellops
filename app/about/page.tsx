import type { Metadata } from "next";
import { AboutPage } from "@/components/blocks/about-page";

export const metadata: Metadata = {
  title: "About PUSHWebb — We Build Systems That Help Brands Grow",
  description:
    "PUSHWebb is a creative and AI-driven marketing agency building flexible content systems that link strategy, storytelling, production, performance, and technology into one process.",
  openGraph: {
    type: "website",
    url: "/about",
    siteName: "PUSHWebb",
    title: "About PUSHWebb — We Build Systems That Help Brands Grow",
    description:
      "Strategy, storytelling, production, performance, and technology in one connected growth system.",
    images: ["/og.png"],
  },
};

export default function Page() {
  return <AboutPage />;
}

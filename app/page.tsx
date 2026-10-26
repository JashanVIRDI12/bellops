import type { Metadata } from "next";
import { Experience } from "@/components/experience/Experience";
import { site } from "@/lib/content";
import { homeFaqs } from "@/lib/home";
import { faqPage, jsonLd } from "@/lib/schema";
import { shareMetadata, siteTitle, structuredData } from "@/lib/seo";

// Set here rather than in the layout, so other pages never inherit the home
// page's canonical or share URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...shareMetadata({
    title: siteTitle,
    description: site.description,
    path: "/",
  }),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {/* The home page's questions, word for word as shown (lib/home.ts). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            ...faqPage(homeFaqs),
          }),
        }}
      />
      <Experience />
    </>
  );
}

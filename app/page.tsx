import type { Metadata } from "next";
import { Experience } from "@/components/experience/Experience";
import { site } from "@/lib/content";
import { homeFaqs } from "@/lib/home";
import { faqPage, jsonLd } from "@/lib/schema";
import { homeUrl, shareMetadata, siteTitle, structuredData } from "@/lib/seo";

// Set here rather than in the layout, so other pages never inherit the home
// page's share card. The canonical and share URL are written out in the page
// (below): Next's metadata always drops the trailing slash from a site's
// root, and the home address is https://www.bellops.in/ everywhere.
export const metadata: Metadata = shareMetadata({
  title: siteTitle,
  description: site.description,
});

export default function Home() {
  return (
    <>
      {/* React places these in <head>. */}
      <link rel="canonical" href={homeUrl} />
      <meta property="og:url" content={homeUrl} />
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

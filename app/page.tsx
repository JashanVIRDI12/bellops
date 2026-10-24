import type { Metadata } from "next";
import { Experience } from "@/components/experience/Experience";
import { site } from "@/lib/content";
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
      <Experience />
    </>
  );
}

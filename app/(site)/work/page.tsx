import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { StudioHero } from "@/components/site/StudioHero";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { workPage } from "@/lib/content";
import { homeUrl, shareMetadata, siteUrl } from "@/lib/seo";
import { breadcrumbs, jsonLd } from "@/lib/services";
import { projects } from "@/lib/work";

export const metadata: Metadata = {
  title: { absolute: `${workPage.title} | Bellops` },
  description: workPage.description,
  alternates: { canonical: workPage.path },
  ...shareMetadata({
    title: workPage.title,
    description: workPage.description,
    path: workPage.path,
  }),
};

const structuredData = {
  "@context": "https://schema.org",
  ...breadcrumbs([
    { name: "Home", url: homeUrl },
    { name: "Work", url: `${siteUrl}${workPage.path}` },
  ]),
};

export default function Work() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <StudioHero
        hour={{ shot: 3, mood: "day" }}
        crumbs={[{ label: "Home", href: "/" }, { label: "Work" }]}
        heading={workPage.heading}
        lead={workPage.lead}
      >
        <Link href="/#contact" className="button button--solid">
          Start a project
        </Link>
      </StudioHero>
      <WorkShowcase
        projects={projects}
        heading={null}
        showAll={false}
        titleLevel="h2"
      />
      <ContactCta />
    </>
  );
}

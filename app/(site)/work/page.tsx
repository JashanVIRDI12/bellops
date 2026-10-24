import type { Metadata } from "next";
import { ContactCta } from "@/components/site/ContactCta";
import { WorkCards } from "@/components/site/WorkCards";
import { workPage } from "@/lib/content";
import { shareMetadata } from "@/lib/seo";
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

export default function Work() {
  return (
    <>
      <section className="site-container pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="site-eyebrow">Work</p>
        <h1 className="site-h1 mt-4">{workPage.heading}</h1>
        <p className="site-lead mt-6">{workPage.lead}</p>
      </section>
      <section aria-label="Projects" className="site-container pb-8">
        <WorkCards projects={projects} headingLevel="h2" />
      </section>
      <ContactCta />
    </>
  );
}

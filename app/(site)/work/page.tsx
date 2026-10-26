import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { StudioHero } from "@/components/site/StudioHero";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { shot, workPage } from "@/lib/content";
import { breadcrumbList, itemList, jsonLd, type Crumb } from "@/lib/schema";
import { shareMetadata } from "@/lib/seo";
import { caseStudyPath, projects } from "@/lib/work";

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

const trail: Crumb[] = [{ label: "Home", href: "/" }, { label: "Work" }];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbList(trail, workPage.path),
    // The case studies, in the order the page shows them.
    itemList(
      workPage.path,
      "Website case studies by Bellops",
      projects.map((project) => ({
        path: caseStudyPath(project),
        name: `${project.client}: ${project.headline}`,
      })),
    ),
  ],
};

export default function Work() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <StudioHero
        hour={{ shot: shot("work"), mood: "day" }}
        crumbs={trail}
        heading={workPage.heading}
        headingSubline={workPage.headingSubline}
        lead={workPage.lead}
      >
        <Link
          href="/#contact"
          className="button button--solid"
          data-cta="get_quote"
        >
          Get a quote
        </Link>
      </StudioHero>
      <section aria-label="About this work" className="wrap block">
        <div className="page-copy">
          {workPage.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
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

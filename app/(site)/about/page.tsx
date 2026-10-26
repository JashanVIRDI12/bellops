import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { Process } from "@/components/site/Process";
import { StudioHero } from "@/components/site/StudioHero";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { aboutPage, approach, studio } from "@/lib/content";
import { breadcrumbList, jsonLd, webPage, type Crumb } from "@/lib/schema";
import { shareMetadata } from "@/lib/seo";
import { projects } from "@/lib/work";

export const metadata: Metadata = {
  title: { absolute: aboutPage.title },
  description: aboutPage.description,
  alternates: { canonical: aboutPage.path },
  ...shareMetadata({
    title: aboutPage.title,
    description: aboutPage.description,
    path: aboutPage.path,
  }),
};

const trail: Crumb[] = [{ label: "Home", href: "/" }, { label: "About" }];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    webPage("AboutPage", aboutPage),
    breadcrumbList(trail, aboutPage.path),
  ],
};

/**
 * The studio: who Bellops is and how it works, in the words the home page
 * already uses. The founder's story joins once Jashan's bio is written.
 */
export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <StudioHero
        hour={aboutPage.hour}
        crumbs={trail}
        heading={studio.heading}
        lead={studio.body}
      >
        <Link
          href="/#contact"
          className="button button--solid"
          data-cta="start_project"
        >
          Start a project
        </Link>
        <Link href="/services" className="button button--ghost">
          Our services
        </Link>
      </StudioHero>
      <section aria-labelledby="approach" className="wrap split block">
        <h2 id="approach" className="block-title">
          {approach.heading}
        </h2>
        <ul className="points">
          {approach.points.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <Process />
      <WorkShowcase projects={projects} />
      <ContactCta />
    </>
  );
}

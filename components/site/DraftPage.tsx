import type { Metadata } from "next";
import type { DraftPage as Draft } from "@/lib/drafts";
import { breadcrumbList, jsonLd, type Crumb } from "@/lib/schema";
import { feedTypes, shareMetadata } from "@/lib/seo";
import { projects } from "@/lib/work";
import { ContactCta } from "./ContactCta";
import { WorkShowcase } from "./WorkShowcase";
import { Crumbs, RevealTitle } from "./RevealTitle";

/** A draft's metadata: its own title and canonical, kept out of search until it's ready. */
export function draftMetadata(page: Draft): Metadata {
  const title = `${page.name} | Bellops`;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: page.path, types: feedTypes },
    ...(page.ready ? {} : { robots: { index: false, follow: true } }),
    ...shareMetadata({ title, description: page.description, path: page.path }),
  };
}

/**
 * The scaffold of a page waiting for its copy (lib/drafts.ts): the trail,
 * the working name as its H1, a placeholder where the copy goes, and the
 * contact CTA. Only local and preview builds show it.
 */
export function DraftPage({ page }: { page: Draft }) {
  const trail: Crumb[] = [
    { label: "Home", href: "/" },
    ...(page.parent ? [page.parent] : []),
    { label: page.name },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            ...breadcrumbList(trail, page.path),
          }),
        }}
      />
      <section className="wrap case-intro">
        <Crumbs trail={trail} />
        <RevealTitle text={page.name} className="case-title" />
        <div className="hero-foot">
          <p className="hero-lead draft-note">
            PLACEHOLDER: this page&apos;s copy comes from the Content Writer
            once Jashan approves it. Until then it isn&apos;t on the live site.
          </p>
        </div>
      </section>
      {page.caseStudies && (
        <WorkShowcase
          projects={projects.filter((project) =>
            page.caseStudies!.includes(project.slug),
          )}
          heading="Related work"
        />
      )}
      <ContactCta />
    </>
  );
}

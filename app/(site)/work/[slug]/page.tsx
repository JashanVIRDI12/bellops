import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/site/ContactCta";
import { Crumbs, RevealTitle } from "@/components/site/RevealTitle";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { workPage } from "@/lib/content";
import { breadcrumbList, jsonLd, type Crumb } from "@/lib/schema";
import { shareMetadata } from "@/lib/seo";
import { caseStudyPath, projectHost, projects } from "@/lib/work";

const projectFor = (slug: string) =>
  projects.find((project) => project.slug === slug);

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = projectFor((await params).slug);
  if (!project) return {};
  const title = `${project.client}: Website Case Study | Bellops`;
  const description = `${project.title}. Designed and built by Bellops.`;
  const path = caseStudyPath(project);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    ...shareMetadata({ title, description, path }),
  };
}

/**
 * One project: what it is, how it looks on a laptop and a phone, and a link
 * to the live site. Real numbers only: results get added once there are some.
 */
export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const project = projectFor((await params).slug);
  if (!project) notFound();
  const others = projects.filter((other) => other.slug !== project.slug);
  const trail: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Work", href: workPage.path },
    { label: project.client },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    ...breadcrumbList(trail, caseStudyPath(project)),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <section className="wrap case-intro">
        <Crumbs trail={trail} />
        <RevealTitle text={project.client} className="case-title" />
        <div className="hero-foot">
          <p className="hero-lead">{project.title}.</p>
          <div className="hero-actions">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--ghost"
              data-track={`project-${project.slug}`}
            >
              Visit {projectHost(project)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <section aria-label="Screens" className="wrap case-screens">
        <figure className="case-desktop">
          <Image
            src={project.image}
            alt={`The ${project.client} website on a laptop screen`}
            width={1600}
            height={1000}
            sizes="(min-width: 1024px) 66vw, 100vw"
            preload
          />
          <figcaption>On a laptop</figcaption>
        </figure>
        <figure className="case-phone">
          <Image
            src={project.mobileImage}
            alt={`The ${project.client} website on a phone`}
            width={780}
            height={1690}
            sizes="(min-width: 1024px) 22vw, 70vw"
          />
          <figcaption>On a phone</figcaption>
        </figure>
      </section>

      <WorkShowcase projects={others} heading="More work" />
      <ContactCta />
    </>
  );
}

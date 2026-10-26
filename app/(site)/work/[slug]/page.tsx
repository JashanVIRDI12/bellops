import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/contact/icons";
import { ContactCta } from "@/components/site/ContactCta";
import { Crumbs, RevealTitle } from "@/components/site/RevealTitle";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { contact, workPage } from "@/lib/content";
import { draftPagesFor } from "@/lib/drafts";
import { caseStudyWhatsappHref } from "@/lib/contact-links";
import { breadcrumbList, creativeWork, jsonLd, type Crumb } from "@/lib/schema";
import { serviceByHref } from "@/lib/services";
import { shareMetadata } from "@/lib/seo";
import {
  caseStudyPath,
  projectHost,
  projects,
  type CaseStudyDetails,
} from "@/lib/work";

// Every project so far is a website, so each case study leads back to that
// service's page (the hub). Give projects their own services once they vary.
const websiteDesign = serviceByHref("/premium-website-design");

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

/** The case study's sections, in order; each shows only when filled in. */
const sections: {
  key: Exclude<keyof CaseStudyDetails, "quote">;
  label: string;
}[] = [
  { key: "brief", label: "Brief" },
  { key: "built", label: "What we built" },
  { key: "stack", label: "Stack" },
  { key: "timeline", label: "Timeline" },
  { key: "result", label: "Result" },
];

/** Brief, what we built, stack, timeline, result and quote: whatever is filled in. */
function Details({ details }: { details?: CaseStudyDetails }) {
  if (!details) return null;
  const filled = sections.filter(({ key }) => {
    const value = details[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  if (filled.length === 0 && !details.quote) return null;
  return (
    <section aria-labelledby="project" className="wrap split block">
      <h2 id="project" className="block-title">
        The project
      </h2>
      <div>
        {filled.length > 0 && (
          <ul className="points">
            {filled.map(({ key, label }) => {
              const value = details[key]!;
              return (
                <li key={key}>
                  <h3>{label}</h3>
                  {Array.isArray(value) ? (
                    <ul className="case-list">
                      {value.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{value}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {details.quote && (
          <figure className="case-quote">
            <blockquote>
              <p>{details.quote.text}</p>
            </blockquote>
            <figcaption>
              {details.quote.name}
              {details.quote.role && <span>, {details.quote.role}</span>}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

/** Pages about this kind of work (industries, services) that list this project. */
function MoreLikeThis({ slug }: { slug: string }) {
  const pages = draftPagesFor(slug);
  if (pages.length === 0) return null;
  return (
    <section aria-labelledby="more-like-this" className="wrap block">
      <h2 id="more-like-this" className="block-title">
        More like this
      </h2>
      <ul className="points">
        {pages.map((page) => (
          <li key={page.path}>
            <h3>
              <Link href={page.path} className="text-link">
                {page.name}
              </Link>
            </h3>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One project: what it is, how it looks on a laptop and a phone, a link to
 * the live site, and its details as they're confirmed. Real facts only:
 * results and quotes get added once the client approves them.
 */
export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const project = projectFor((await params).slug);
  if (!project) notFound();
  const others = projects.filter((other) => other.slug !== project.slug);
  const whatsapp = {
    href: caseStudyWhatsappHref(project.client),
    track: `whatsapp-case-${project.slug}`,
  };
  const trail: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Work", href: workPage.path },
    { label: project.client },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      creativeWork({
        path: caseStudyPath(project),
        name: `${project.client} website`,
        description: `${project.title}. Designed and built by Bellops.`,
        url: project.url,
        images: [project.image, project.mobileImage],
        servicePath: websiteDesign.href,
      }),
      breadcrumbList(trail, caseStudyPath(project)),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <section className="wrap case-intro" data-ga-location="hero">
        <Crumbs trail={trail} />
        <RevealTitle
          text={project.client}
          subline={project.headline}
          className="case-title"
        />
        <div className="hero-foot">
          <div>
            <p className="hero-lead">{project.title}.</p>
            <p className="case-service">
              Service:{" "}
              <Link href={websiteDesign.href} className="text-link">
                Website design
              </Link>
            </p>
          </div>
          <div className="hero-actions">
            <a
              href={whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--light"
              data-track={whatsapp.track}
            >
              <WhatsAppIcon />
              {contact.whatsapp}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
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

      <Details details={project.details} />
      <MoreLikeThis slug={project.slug} />
      <WorkShowcase projects={others} heading="More work" />
      <ContactCta whatsapp={whatsapp} />
    </>
  );
}

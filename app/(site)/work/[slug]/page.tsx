import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/site/ContactCta";
import { WorkCards } from "@/components/site/WorkCards";
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

  return (
    <>
      <section className="site-container pt-12 pb-12 md:pt-20 md:pb-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/60">
          <Link href="/work" className="site-link">
            Work
          </Link>
          <span aria-hidden> / </span>
          <span aria-current="page">{project.client}</span>
        </nav>
        <h1 className="site-h1 mt-6">{project.client}</h1>
        <p className="site-lead mt-6">{project.title}.</p>
        <p className="mt-8">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="site-button-ghost"
            data-track={`project-${project.slug}`}
          >
            Visit {projectHost(project)} <span aria-hidden>↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </section>

      <section
        aria-label="Screens"
        className="site-container grid items-end gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]"
      >
        <figure className="site-card">
          <Image
            src={project.image}
            alt={`The ${project.client} website on a laptop screen`}
            width={1600}
            height={1000}
            sizes="(min-width: 768px) 70vw, 100vw"
            preload
            className="aspect-[16/10] w-full object-cover"
          />
          <figcaption className="p-4 text-sm text-white/60">Desktop</figcaption>
        </figure>
        <figure className="site-card mx-auto w-full max-w-xs md:max-w-none">
          <Image
            src={project.mobileImage}
            alt={`The ${project.client} website on a phone`}
            width={780}
            height={1690}
            sizes="(min-width: 768px) 23vw, 80vw"
            className="aspect-[780/1690] w-full object-cover"
          />
          <figcaption className="p-4 text-sm text-white/60">Mobile</figcaption>
        </figure>
      </section>

      <section
        aria-labelledby="more-work"
        className="site-container py-16 md:py-20"
      >
        <h2 id="more-work" className="site-h2">
          More work
        </h2>
        <div className="mt-10">
          <WorkCards projects={others} />
        </div>
      </section>

      <ContactCta />
    </>
  );
}

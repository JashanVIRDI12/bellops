import Image from "next/image";
import Link from "next/link";
import { workPage } from "@/lib/content";
import { caseStudyPath, type WorkProject } from "@/lib/work";

/**
 * Projects, laid out like a magazine spread rather than a row of identical
 * cards: the first one large, the rest beside it.
 */
export function WorkShowcase({
  projects,
  heading = "Selected work",
  showAll = true,
  titleLevel = "h3",
}: {
  projects: readonly WorkProject[];
  heading?: string | null;
  /** Link to the work page. */
  showAll?: boolean;
  titleLevel?: "h2" | "h3";
}) {
  const Title = titleLevel;
  return (
    <section
      aria-labelledby={heading ? "work-heading" : undefined}
      aria-label={heading ? undefined : "Projects"}
      className="wrap block"
    >
      {heading && (
        <div className="block-head">
          <h2 id="work-heading" className="block-title">
            {heading}
          </h2>
          {showAll && (
            <Link href={workPage.path} className="text-link">
              All work
            </Link>
          )}
        </div>
      )}
      <ul className="showcase" data-count={projects.length}>
        {projects.map((project, index) => (
          <li key={project.slug}>
            <Link href={caseStudyPath(project)} className="showcase-item">
              <span className="showcase-frame">
                <Image
                  src={project.image}
                  alt={`The ${project.client} website`}
                  width={1600}
                  height={1000}
                  sizes={
                    index === 0 && projects.length === 3
                      ? "(min-width: 768px) 90vw, 100vw"
                      : "(min-width: 768px) 45vw, 100vw"
                  }
                />
              </span>
              <span className="showcase-caption">
                <Title className="showcase-client">{project.client}</Title>
                <span className="showcase-title">{project.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

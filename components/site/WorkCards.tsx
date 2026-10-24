import Image from "next/image";
import Link from "next/link";
import { caseStudyPath, type WorkProject } from "@/lib/work";

/** Project cards linking to their case studies. */
export function WorkCards({
  projects,
  headingLevel = "h3",
}: {
  projects: readonly WorkProject[];
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {projects.map((project) => (
        <li key={project.slug}>
          <Link href={caseStudyPath(project)} className="site-card group">
            <Image
              src={project.image}
              alt={`The ${project.client} website`}
              width={1600}
              height={1000}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="p-5">
              <Heading className="font-heading text-lg font-medium text-white">
                {project.client}
              </Heading>
              <p className="mt-1 text-sm text-white/70">{project.title}</p>
              <p className="text-violet-soft mt-4 text-sm font-bold">
                Read the case study <span aria-hidden>→</span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

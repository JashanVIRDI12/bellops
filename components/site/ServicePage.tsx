import Link from "next/link";
import { approach, services } from "@/lib/content";
import { projects } from "@/lib/work";
import { ContactCta } from "./ContactCta";
import { WorkCards } from "./WorkCards";

type ServiceCopy = {
  heading: string;
  lead: string;
};

/**
 * A service page: what it is, how the studio works, the work, related
 * services and a way to get in touch. Copy comes from lib/content.ts.
 */
export function ServicePage({
  page,
  related,
}: {
  page: ServiceCopy;
  /** Other services worth a look from here; those with a page are linked. */
  related: readonly string[];
}) {
  const relatedServices = services.items.filter((item) =>
    related.includes(item.title),
  );
  return (
    <>
      <section className="site-container pt-16 pb-14 md:pt-24 md:pb-20">
        <p className="site-eyebrow">Services</p>
        <h1 className="site-h1 mt-4">{page.heading}</h1>
        <p className="site-lead mt-6">{page.lead}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/#contact" className="intro-cta">
            Start a project
          </Link>
          <Link href="/work" className="site-button-ghost">
            See the work
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="approach"
        className="site-container border-t border-white/10 py-16 md:py-20"
      >
        <h2 id="approach" className="site-h2 max-w-2xl">
          {approach.heading}
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {approach.points.map((point) => (
            <li key={point.title}>
              <h3 className="text-violet-soft font-bold">{point.title}</h3>
              <p className="mt-2 text-white/80">{point.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="work"
        className="site-container border-t border-white/10 py-16 md:py-20"
      >
        <h2 id="work" className="site-h2">
          Selected work
        </h2>
        <div className="mt-10">
          <WorkCards projects={projects} />
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section
          aria-labelledby="related"
          className="site-container border-t border-white/10 py-16 md:py-20"
        >
          <h2 id="related" className="site-h2">
            Often paired with
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {relatedServices.map((item) => (
              <li key={item.title} className="site-panel">
                <h3 className="font-heading text-xl font-medium text-white">
                  {"href" in item && item.href ? (
                    <Link href={item.href} className="site-link">
                      {item.title} <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="mt-2 text-white/80">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContactCta />
    </>
  );
}

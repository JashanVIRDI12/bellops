import Link from "next/link";
import type { Service } from "@/lib/content";
import { serviceByHref, serviceStructuredData, jsonLd } from "@/lib/services";
import { projects } from "@/lib/work";
import { ContactCta } from "./ContactCta";
import { Faq } from "./Faq";
import { Included } from "./Included";
import { Process } from "./Process";
import { ServiceRows } from "./ServiceRows";
import { StudioHero } from "./StudioHero";
import { WorkShowcase } from "./WorkShowcase";

/**
 * A service page: the studio at the service's hour, what's included, how a
 * project runs, the work, related services, questions, and the way in.
 */
export function ServicePage({ service }: { service: Service }) {
  const related = service.page.related.map(serviceByHref);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(serviceStructuredData(service)),
        }}
      />
      <StudioHero
        hour={service.page.hour}
        crumbs={[
          { label: "Services", href: "/services" },
          { label: service.nav },
        ]}
        heading={service.page.heading}
        lead={service.page.lead}
      >
        <Link
          href="/#contact"
          className="button button--solid"
          data-track={`service-start-${service.href.slice(1)}`}
        >
          Start a project
        </Link>
        <Link href="/work" className="button button--ghost">
          See the work
        </Link>
      </StudioHero>
      <Included items={service.page.included} />
      <Process />
      <WorkShowcase projects={projects} />
      <section aria-labelledby="related" className="wrap block">
        <div className="block-head">
          <h2 id="related" className="block-title">
            Often paired with
          </h2>
        </div>
        <ServiceRows items={related} />
      </section>
      <Faq />
      <ContactCta />
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/lib/content";
import { formatPrice } from "@/lib/pricing";
import { jsonLd } from "@/lib/schema";
import {
  serviceByHref,
  serviceStructuredData,
  serviceTrail,
} from "@/lib/services";
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
        crumbs={serviceTrail(service)}
        heading={service.page.heading}
        lead={service.page.lead}
        note={formatPrice(service.price)}
      >
        <Link
          href="/#contact"
          className="button button--solid"
          data-track={`service-start-${service.href.slice(1)}`}
          data-cta="start_project"
        >
          Start a project
        </Link>
        <Link href="/work" className="button button--ghost" data-cta="see_work">
          See the work
        </Link>
      </StudioHero>
      <section className="wrap block">
        <div className="service-image-band">
          <div data-photo>
            <Image
              src={service.navImage}
              alt={
                "A closer look at the work behind " + service.nav.toLowerCase()
              }
              width={960}
              height={600}
              sizes="(min-width: 900px) 50vw, 90vw"
            />
          </div>
          <div data-enter>
            <p className="studio-label">Thought through. Built with care.</p>
            <h2>
              A little more
              <br />
              than the expected.
            </h2>
            <p>{service.page.lead}</p>
          </div>
        </div>
      </section>
      <Included items={service.page.included} />
      <Process />
      <WorkShowcase projects={projects} heading="Related work" />
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

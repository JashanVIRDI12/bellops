import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { Faq } from "@/components/site/Faq";
import { Process } from "@/components/site/Process";
import { ServiceRows } from "@/components/site/ServiceRows";
import { StudioHero } from "@/components/site/StudioHero";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { servicesPage } from "@/lib/content";
import { homeUrl, shareMetadata, siteUrl } from "@/lib/seo";
import { allServices, breadcrumbs, jsonLd } from "@/lib/services";
import { projects } from "@/lib/work";

export const metadata: Metadata = {
  title: { absolute: servicesPage.title },
  description: servicesPage.description,
  alternates: { canonical: servicesPage.path },
  ...shareMetadata({
    title: servicesPage.title,
    description: servicesPage.description,
    path: servicesPage.path,
  }),
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      name: "Bellops services",
      itemListElement: allServices.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.title,
        url: `${siteUrl}${service.href}`,
      })),
    },
    breadcrumbs([
      { name: "Home", url: homeUrl },
      { name: "Services", url: `${siteUrl}${servicesPage.path}` },
    ]),
  ],
};

/** Every service, each leading to its own page. */
export default function Services() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <StudioHero
        hour={servicesPage.hour}
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        heading={servicesPage.heading}
        lead={servicesPage.lead}
      >
        <Link href="/#contact" className="button button--solid">
          Start a project
        </Link>
      </StudioHero>
      <section aria-label="All services" className="wrap block">
        <ServiceRows items={allServices} titleLevel="h2" preview />
      </section>
      <Process />
      <WorkShowcase projects={projects} />
      <Faq />
      <ContactCta />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { Faq } from "@/components/site/Faq";
import { Process } from "@/components/site/Process";
import { Capabilities } from "@/components/site/Capabilities";
import { StudioHero } from "@/components/site/StudioHero";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { servicesPage } from "@/lib/content";
import { breadcrumbList, jsonLd, type Crumb } from "@/lib/schema";
import { shareMetadata, siteUrl } from "@/lib/seo";
import { allServices, servicesFaqs } from "@/lib/services";
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

const trail: Crumb[] = [{ label: "Home", href: "/" }, { label: "Services" }];

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
    breadcrumbList(trail, servicesPage.path),
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
        crumbs={trail}
        heading={servicesPage.heading}
        lead={servicesPage.lead}
      >
        <Link
          href="/#contact"
          className="button button--solid"
          data-cta="get_quote"
        >
          Get a quote
        </Link>
      </StudioHero>
      <section aria-label="All services" className="wrap services-editorial">
        <p className="studio-label">The right expertise, all in one place.</p>
        <Capabilities items={allServices} />
      </section>
      <Process />
      <WorkShowcase projects={projects} />
      <Faq items={servicesFaqs()} />
      <ContactCta />
    </>
  );
}

import type { Metadata } from "next";
import { services, type Service } from "./content";
import { homeUrl, shareMetadata, siteUrl } from "./seo";

export const allServices: readonly Service[] = services.items;

export function serviceByHref(href: string): Service {
  const service = allServices.find((item) => item.href === href);
  if (!service) throw new Error(`No service at ${href}`);
  return service;
}

/** Structured data for a service page: the service itself, and where it sits. */
export function serviceStructuredData(service: Service) {
  const url = `${siteUrl}${service.href}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        description: service.page.description,
        url,
        serviceType: service.title,
        areaServed: { "@type": "Country", name: "India" },
        provider: { "@id": `${siteUrl}/#organization` },
      },
      breadcrumbs([
        { name: "Home", url: homeUrl },
        { name: "Services", url: `${siteUrl}/services` },
        { name: service.nav, url },
      ]),
    ],
  };
}

/** A BreadcrumbList for a trail of pages. */
export function breadcrumbs(trail: readonly { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/** Serializes structured data for a <script type="application/ld+json">. */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/** A service page's metadata: its own title, description, canonical and share card. */
export function serviceMetadata(service: Service): Metadata {
  const { title, description } = service.page;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: service.href },
    ...shareMetadata({ title, description, path: service.href }),
  };
}

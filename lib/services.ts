import type { Metadata } from "next";
import { services, servicesPage, type Service } from "./content";
import { breadcrumbList, service as serviceNode, type Crumb } from "./schema";
import { shareMetadata } from "./seo";

export const allServices: readonly Service[] = services.items;

export function serviceByHref(href: string): Service {
  const service = allServices.find((item) => item.href === href);
  if (!service) throw new Error(`No service at ${href}`);
  return service;
}

/** Where a service page sits: Home, Services, the service. */
export const serviceTrail = (service: Service): Crumb[] => [
  { label: "Home", href: "/" },
  { label: "Services", href: servicesPage.path },
  { label: service.nav },
];

/** Structured data for a service page: the service itself, and where it sits. */
export function serviceStructuredData(service: Service) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      serviceNode({
        path: service.href,
        name: service.title,
        description: service.page.description,
      }),
      breadcrumbList(serviceTrail(service), service.href),
    ],
  };
}

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

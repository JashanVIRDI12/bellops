import type { Metadata } from "next";
import {
  COST_QUESTION,
  faqs,
  services,
  servicesPage,
  type Service,
} from "./content";
import { formatRate } from "./pricing";
import { breadcrumbList, service as serviceNode, type Crumb } from "./schema";
import { feedTypes, shareMetadata } from "./seo";

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
    alternates: { canonical: service.href, types: feedTypes },
    ...shareMetadata({ title, description, path: service.href }),
  };
}

/** The common questions, then "What does it cost?" answered by `answer`. */
const faqsWithCost = (answer: string) => [
  ...faqs,
  { question: COST_QUESTION, answer },
];

/** A service page's questions: the cost answer names its starting price. */
export const serviceFaqs = (service: Service) =>
  faqsWithCost(
    service.page.priceAnswer.replace("{price}", formatRate(service.price)),
  );

/** /services' questions: the cost answer gives the lowest and the website price. */
export const servicesFaqs = () =>
  faqsWithCost(
    servicesPage.priceAnswer
      .replace("{care}", formatRate(serviceByHref("/website-care-plans").price))
      .replace(
        "{premium}",
        formatRate(serviceByHref("/premium-website-design").price),
      ),
  );

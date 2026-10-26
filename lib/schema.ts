/*
 * Structured data (schema.org JSON-LD) templates for the inner pages:
 * Service (service pages), CreativeWork (case studies), BlogPosting (blog
 * posts), BreadcrumbList (every inner page) and page nodes. Every node that
 * names who made, offers or published something points at the one
 * Organization on the home page (lib/seo.ts), by its @id.
 */

import { siteUrl } from "./seo";

export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;

/** A page node (AboutPage, ContactPage, …) inside the site. */
export function webPage(
  type: string,
  page: { path: string; title: string; description: string },
) {
  return {
    "@type": type,
    "@id": `${siteUrl}${page.path}#webpage`,
    url: `${siteUrl}${page.path}`,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
  };
}

/** A service the studio offers, on its own page. */
export function service(item: {
  path: string;
  name: string;
  description: string;
}) {
  const url = `${siteUrl}${item.path}`;
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: item.name,
    description: item.description,
    url,
    serviceType: item.name,
    areaServed: { "@type": "Country", name: "India" },
    provider: { "@id": organizationId },
  };
}

/**
 * A project the studio made (a case study): the client's website itself,
 * with the case-study page as its main page. Real facts only: no results
 * until there are approved ones.
 */
export function creativeWork(work: {
  path: string;
  name: string;
  description: string;
  /** The live project. */
  url: string;
  images: readonly string[];
  /** The service page it was made under. */
  servicePath: string;
}) {
  const page = `${siteUrl}${work.path}`;
  return {
    "@type": "CreativeWork",
    "@id": `${page}#work`,
    name: work.name,
    description: work.description,
    url: work.url,
    mainEntityOfPage: page,
    image: work.images.map((image) => `${siteUrl}${image}`),
    creator: { "@id": organizationId },
    about: { "@id": `${siteUrl}${work.servicePath}#service` },
  };
}

/** The author of a post: a person who works for the studio. */
const person = (name: string) => ({
  "@type": "Person",
  name,
  worksFor: { "@id": organizationId },
});

/** A blog post (BlogPosting, a kind of Article), published by the studio. */
export function blogPosting(post: {
  path: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  author: string;
  hubUrl: string;
}) {
  const url = `${siteUrl}${post.path}`;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    inLanguage: "en",
    author: person(post.author),
    publisher: { "@id": organizationId },
    isPartOf: { "@id": `${siteUrl}/blog#blog` },
    about: { "@id": `${post.hubUrl}#service` },
  };
}

/** Questions and answers shown on the page, word for word. */
export function faqPage(
  items: readonly { question: string; answer: string }[],
) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** One step of a breadcrumb trail. The current page, last, has no href. */
export type Crumb = { label: string; href?: string };

/**
 * The BreadcrumbList for the trail shown on the page (components/site
 * Crumbs), so the two always match. `path` is the current page's path.
 */
export function breadcrumbList(trail: readonly Crumb[], path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `${siteUrl}${crumb.href ?? path}`,
    })),
  };
}

/** Serializes structured data for a <script type="application/ld+json">. */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

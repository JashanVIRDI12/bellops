/*
 * Structured data (schema.org JSON-LD) templates for the inner pages:
 * Service (service pages), CreativeWork (case studies), BlogPosting, FAQPage
 * and Dataset (blog posts), BreadcrumbList (every inner page) and page nodes. Every node that
 * names who made, offers or published something points at the one
 * Organization on the home page (lib/seo.ts), by its @id.
 */

import { site } from "./content";
import { siteUrl } from "./seo";

export const organizationId = `${siteUrl}/#organization`;

/**
 * The studio, by its @id with its name and address: the full Organization
 * is on the home page only, and a blog post's author, publisher or a
 * dataset's creator needs a name on the post's own page.
 */
const studio = {
  "@type": "Organization",
  "@id": organizationId,
  name: site.name,
  url: `${siteUrl}/`,
};
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
  worksFor: studio,
});

/**
 * A blog post (BlogPosting and Article), published by the studio. Its
 * author is the studio itself (byStudio) or a person who works there.
 * Dates are YYYY-MM-DD, India time.
 */
export function blogPosting(post: {
  path: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  author: string;
  byStudio: boolean;
  /** Absolute URL of its share picture. */
  image: string;
  tags: readonly string[];
  /** Absolute URL of the service page it supports, if any. */
  hubUrl?: string;
}) {
  const url = `${siteUrl}${post.path}`;
  const indiaTime = (date: string) => `${date}T00:00:00+05:30`;
  return {
    // An Article for search engines; BlogPosting says which kind.
    "@type": ["BlogPosting", "Article"],
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [post.image],
    datePublished: indiaTime(post.published),
    dateModified: indiaTime(post.updated ?? post.published),
    inLanguage: "en-IN",
    keywords: post.tags.join(", "),
    author: post.byStudio ? studio : person(post.author),
    publisher: studio,
    isPartOf: { "@id": `${siteUrl}/blog#blog` },
    ...(post.hubUrl ? { about: { "@id": `${post.hubUrl}#service` } } : {}),
  };
}

/**
 * Data a post publishes as a download (a CSV), made by the studio:
 * schema.org Dataset, for Google's dataset search.
 */
export function dataset(data: {
  path: string;
  name: string;
  description: string;
  /** The file's absolute URL. */
  fileUrl: string;
  encodingFormat: string;
  measurementTechnique: string;
  variableMeasured: readonly string[];
  temporalCoverage?: string;
  published: string;
}) {
  const url = `${siteUrl}${data.path}`;
  return {
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: data.name,
    description: data.description,
    url,
    creator: studio,
    publisher: studio,
    datePublished: data.published,
    ...(data.temporalCoverage
      ? { temporalCoverage: data.temporalCoverage }
      : {}),
    measurementTechnique: data.measurementTechnique,
    variableMeasured: data.variableMeasured,
    isAccessibleForFree: true,
    inLanguage: "en-IN",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: data.encodingFormat,
        contentUrl: data.fileUrl,
      },
    ],
    subjectOf: { "@id": `${url}#article` },
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

/** A list of pages in order (ItemList), e.g. the case studies on /work. */
export function itemList(
  path: string,
  name: string,
  items: readonly { path: string; name: string }[],
) {
  return {
    "@type": "ItemList",
    "@id": `${siteUrl}${path}#list`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${item.path}`,
      name: item.name,
    })),
  };
}

/** Serializes structured data for a <script type="application/ld+json">. */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

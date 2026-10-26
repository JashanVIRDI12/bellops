/*
 * Structured data (schema.org JSON-LD) shared by the inner pages. Every node
 * that names who made or offers something points at the one Organization on
 * the home page (lib/seo.ts), by its @id.
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

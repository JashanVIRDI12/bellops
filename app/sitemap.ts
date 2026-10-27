import type { MetadataRoute } from "next";
import {
  aboutPage,
  blogPage,
  contactPage,
  services,
  servicesPage,
  workPage,
} from "@/lib/content";
import { getPublishedPosts, postDate, postPath } from "@/lib/blog";
import { draftPages } from "@/lib/drafts";
import { threeDPage } from "@/lib/three-d";
import { homeUrl, siteUrl } from "@/lib/seo";
import { caseStudyPath, projects } from "@/lib/work";
import pageDates from "@/lib/sitemap-dates.json";

/**
 * When a page last changed: the date of the last commit to its sources
 * (lib/sitemap-dates.json, written by scripts/sitemap-dates.mjs before each
 * build), or the build's date for a page that isn't in it yet.
 */
function changed(path: string, buildDate: Date) {
  const date = (pageDates as Record<string, string>)[path];
  return date ? new Date(date) : buildDate;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cached, so it's built once per deploy, not on every request.
  "use cache";
  // Hash sections and internal demos aren't URLs to index separately. Add an
  // entry here for each public page.
  const built = new Date();
  const paths = [
    servicesPage.path,
    ...services.items.map((service) => service.href),
    threeDPage.path,
    workPage.path,
    ...projects.map(caseStudyPath),
    aboutPage.path,
    contactPage.path,
    // Scaffolds join once their copy is in (lib/drafts.ts).
    ...draftPages.filter((page) => page.ready).map((page) => page.path),
  ];
  // The blog index always; posts once published (drafts never), each dated.
  const blog = [
    {
      url: `${siteUrl}${blogPage.path}`,
      lastModified: changed(blogPage.path, built),
    },
    ...getPublishedPosts().map((post) => ({
      url: `${siteUrl}${postPath(post)}`,
      lastModified: postDate(post.updated ?? post.date),
    })),
  ];
  return [
    { url: homeUrl, lastModified: changed("/", built) },
    ...paths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: changed(path, built),
    })),
    ...blog,
  ];
}

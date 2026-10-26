import type { MetadataRoute } from "next";
import {
  aboutPage,
  contactPage,
  services,
  servicesPage,
  workPage,
} from "@/lib/content";
import { blogPage, postPath, publishedPosts } from "@/lib/blog";
import { draftPages } from "@/lib/drafts";
import { threeDPage } from "@/lib/three-d";
import { homeUrl, siteUrl } from "@/lib/seo";
import { caseStudyPath, projects } from "@/lib/work";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cached, so it's built once per deploy and lastModified is the build's
  // date, not "now" on every request.
  "use cache";
  // Hash sections and internal demos aren't URLs to index separately. Add an
  // entry here for each public page.
  const lastModified = new Date();
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
    { url: `${siteUrl}${blogPage.path}`, lastModified },
    ...publishedPosts.map((post) => ({
      url: `${siteUrl}${postPath(post)}`,
      lastModified: new Date(post.updated ?? post.published),
    })),
  ];
  return [
    { url: homeUrl, lastModified },
    ...paths.map((path) => ({ url: `${siteUrl}${path}`, lastModified })),
    ...blog,
  ];
}

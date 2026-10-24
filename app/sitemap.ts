import type { MetadataRoute } from "next";
import { homeUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Hash sections and internal demos aren't URLs to index separately. Add an
  // entry here for each public page.
  return [{ url: homeUrl, lastModified: new Date() }];
}

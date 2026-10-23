import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // The public site is one page. Hash sections and internal demos aren't URLs
  // to index separately. Add entries here when real public pages are added.
  return [{ url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 }];
}

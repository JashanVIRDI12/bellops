import { getPublishedPosts, postDate, postPath } from "@/lib/blog";
import { blogPage, site } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

/**
 * /rss.xml: an RSS 2.0 feed of the published posts, newest first (never
 * drafts). Prerendered with each build, like the pages. Every page points to
 * it (lib/seo.ts, feedTypes); the old /blog/rss.xml redirects here
 * (next.config.ts).
 */
const escape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function GET() {
  const posts = getPublishedPosts();
  const blogUrl = `${siteUrl}${blogPage.path}`;
  const items = posts
    .map((post) => {
      const url = `${siteUrl}${postPath(post)}`;
      return [
        "    <item>",
        `      <title>${escape(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escape(post.description)}</description>`,
        `      <pubDate>${postDate(post.date).toUTCString()}</pubDate>`,
        `      <dc:creator>${escape(post.author)}</dc:creator>`,
        ...post.tags.map((tag) => `      <category>${escape(tag)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  const latest = posts[0];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escape(`${site.name} Blog`)}</title>`,
    `    <link>${blogUrl}</link>`,
    `    <description>${escape(blogPage.description)}</description>`,
    "    <language>en-IN</language>",
    `    <atom:link href="${siteUrl}${blogPage.rss}" rel="self" type="application/rss+xml"/>`,
    ...(latest
      ? [
          `    <lastBuildDate>${postDate(latest.updated ?? latest.date).toUTCString()}</lastBuildDate>`,
        ]
      : []),
    ...(items ? [items] : []),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

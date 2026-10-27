import index from "./blog-index.json";
import { site } from "./content";
import { liveSite } from "./drafts";

/**
 * The blog. Each post is one file, content/blog/<slug>.mdx: its frontmatter
 * (title, description, slug, date, author, ogImage, tags, draft) and its
 * text. content/blog/how-to-add-a-post.mdx explains the steps.
 *
 * scripts/blog-index.mjs reads the posts into lib/blog-index.json whenever
 * Next starts (and on every change in dev), so the pages, the sitemap, RSS
 * and proxy.ts share one list and never read files at request time.
 *
 * Drafts (draft: true) show in development and on Vercel preview
 * deployments. On the live site they answer 404 (proxy.ts) unless the
 * request carries the preview secret, and they're never in /blog, the
 * sitemap or RSS, and never indexed (noindex).
 */
export type TocEntry = { id: string; text: string; depth: number };
export type FaqEntry = { question: string; answer: string };

/** A data file a post publishes (schema.org Dataset), from its frontmatter. */
export type PostDataset = {
  name: string;
  description: string;
  /** The download, a file in public/ (/blog/…/data.csv). */
  file: string;
  measurementTechnique: string;
  variableMeasured: string[];
  temporalCoverage?: string;
};

export type Post = {
  /** The address, /blog/<slug>, and the file name, content/blog/<slug>.mdx. */
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD, India time. */
  date: string;
  /** YYYY-MM-DD, when the post last changed in substance. */
  updated?: string;
  /** "Bellops" credits the studio; a name credits that person. */
  author: string;
  tags: string[];
  draft: boolean;
  /** Instructions for writing posts: never listed, never live. */
  template?: boolean;
  /** A service page the post supports, linked under it. */
  hub?: string;
  /** The share picture, a file in public/, and a hash of it. */
  ogImage?: string;
  ogImageVersion?: string;
  readingMinutes: number;
  /** The H2s and H3s, for the contents list. */
  toc: TocEntry[];
  /** The questions under its FAQ heading (FAQPage schema). */
  faq: FaqEntry[];
  dataset?: PostDataset;
};

/** Every post, drafts and the template included, newest first. */
const posts = index.posts as Post[];

/**
 * The posts a list shows, newest first: published ones, plus drafts
 * wherever drafts are visible (not on the live site). Never the template.
 */
export function getAllPosts({ includeDrafts = !liveSite } = {}) {
  return posts.filter(
    (post) => !post.template && (includeDrafts || !post.draft),
  );
}

/** Published posts only: the sitemap, RSS and the Blog schema go by these. */
export const getPublishedPosts = () => getAllPosts({ includeDrafts: false });

/** Any post by its slug, drafts and the template included. */
export const getPostBySlug = (slug: string) =>
  posts.find((post) => post.slug === slug);

/** Every slug, for prerendering: proxy.ts keeps drafts off the live site. */
export const allSlugs = () => posts.map((post) => post.slug);

export const postPath = (post: Pick<Post, "slug">) => `/blog/${post.slug}`;

/**
 * The share picture's address, with its hash as ?v= so a replaced picture
 * isn't served from social networks' caches.
 */
export const postImage = (post: Post) =>
  post.ogImage ? `${post.ogImage}?v=${post.ogImageVersion}` : undefined;

/** Whether the studio, not a person, wrote it. */
export const byStudio = (post: Post) => post.author === site.name;

/** Midnight at the start of the post's date, India time. */
export const postDate = (date: string) => new Date(`${date}T00:00:00+05:30`);

/** "27 Oct 2026", India time. */
export function formatPostDate(date: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(postDate(date));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("day")} ${part("month")} ${part("year")}`;
}

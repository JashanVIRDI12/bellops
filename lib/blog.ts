import { liveSite } from "./drafts";

/**
 * The blog: one entry here per post, newest first, with its text in
 * content/blog/<slug>.mdx. content/blog/how-to-add-a-post.mdx explains the
 * steps; copy it to start a post.
 *
 * Drafts (draft: true) show on local and preview builds only; on the live
 * site they answer 404 and stay out of the sitemap. /blog itself goes live
 * with the first published post, and the header and footer link to it then.
 */
export type Post = {
  /** The address, /blog/<slug>, and the file name, content/blog/<slug>.mdx. */
  slug: string;
  /** The H1 and the title in search results (keep it under ~60 characters). */
  title: string;
  /** The search snippet (under ~160 characters). */
  description: string;
  /** YYYY-MM-DD. */
  published: string;
  /** YYYY-MM-DD, when the post was last changed in substance. */
  updated?: string;
  /** The service page (hub) the post supports, linked at its end. */
  hub: string;
  /** Defaults to Jashan Singh. */
  author?: string;
  draft?: boolean;
  /**
   * Instructions for writing posts, not a post: never listed on /blog (on
   * local builds it can still be opened at its address).
   */
  template?: boolean;
};

export const defaultAuthor = "Jashan Singh";

export const posts: readonly Post[] = [
  {
    slug: "how-to-add-a-post",
    title: "How to add a blog post",
    description:
      "The template for a weekly post: where the file goes, what its entry needs, and what the text can use.",
    published: "2026-10-26",
    hub: "/premium-website-design",
    draft: true,
    template: true,
  },
];

/** Posts the live site shows; local and preview builds show drafts too. */
export const visiblePosts: readonly Post[] = posts
  .filter((post) => !post.template && (!post.draft || !liveSite))
  .sort((a, b) => b.published.localeCompare(a.published));

/** Published posts only: what the sitemap, header and footer go by. */
export const publishedPosts = visiblePosts.filter((post) => !post.draft);

export const postPath = (post: Pick<Post, "slug">) => `/blog/${post.slug}`;

export const postBySlug = (slug: string) =>
  posts.find((post) => post.slug === slug);

export const blogPage = {
  path: "/blog",
  title: "Blog: Web Design, 3D Websites, Ads and SEO | Bellops",
  description:
    "Articles from Bellops on web design, 3D websites, landing pages, Google and Meta ads, and SEO.",
  heading: "Blog",
};

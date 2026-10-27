import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/site/ContactCta";
import { Crumbs } from "@/components/site/RevealTitle";
import { ServiceRows } from "@/components/site/ServiceRows";
import {
  blogPage,
  defaultAuthor,
  postBySlug,
  postPath,
  posts,
} from "@/lib/blog";
import { blogPosting, breadcrumbList, jsonLd, type Crumb } from "@/lib/schema";
import { shareMetadata, siteUrl } from "@/lib/seo";
import { serviceByHref } from "@/lib/services";

/*
 * Allowed to block on navigation: every page here is prerendered from
 * generateStaticParams, so the wait is a cached fetch, and blocking keeps
 * the whole page in one piece (no placeholder while its content streams).
 * Without this, Next 16's instant-navigation check flags the params read.
 */
export const instant = false;

// Every post, drafts included: proxy.ts keeps drafts and unknown slugs off
// the live site with a real 404.
export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  if (!post) return {};
  const title = `${post.title} | Bellops`;
  const path = postPath(post);
  const share = shareMetadata({ title, description: post.description, path });
  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical: path },
    ...(post.draft ? { robots: { index: false, follow: true } } : {}),
    ...share,
    openGraph: {
      ...share.openGraph,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [post.author ?? defaultAuthor],
    },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** One post: the text, who wrote it and when, its service page, the way in. */
export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const { default: Text } = await import(`@/content/blog/${post.slug}.mdx`);
  const hub = serviceByHref(post.hub);
  const author = post.author ?? defaultAuthor;
  const path = postPath(post);
  const trail: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Blog", href: blogPage.path },
    { label: post.title },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      blogPosting({
        path,
        title: post.title,
        description: post.description,
        published: post.published,
        updated: post.updated,
        author,
        hubUrl: `${siteUrl}${hub.href}`,
      }),
      breadcrumbList(trail, path),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <article className="wrap post">
        <header className="post-head">
          <Crumbs trail={trail} />
          <h1 className="post-title">{post.title}</h1>
          <p className="post-meta">
            {author} ·{" "}
            <time dateTime={post.published}>
              {dateFormat.format(new Date(post.published))}
            </time>
            {post.draft && <span className="post-draft">Draft</span>}
          </p>
        </header>
        <div className="post-body">
          <Text />
        </div>
      </article>
      <section aria-labelledby="post-hub" className="wrap block">
        <div className="block-head">
          <h2 id="post-hub" className="block-title">
            The service behind this post
          </h2>
        </div>
        <ServiceRows items={[hub]} />
      </section>
      <ContactCta />
    </>
  );
}

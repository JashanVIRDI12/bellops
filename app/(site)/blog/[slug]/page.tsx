import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PostToc } from "@/components/blog/PostToc";
import { ContactCta } from "@/components/site/ContactCta";
import { Crumbs } from "@/components/site/RevealTitle";
import { ServiceRows } from "@/components/site/ServiceRows";
import {
  allSlugs,
  byStudio,
  formatPostDate,
  getPostBySlug,
  postImage,
  postPath,
} from "@/lib/blog";
import { blogPage } from "@/lib/content";
import {
  blogPosting,
  breadcrumbList,
  dataset,
  faqPage,
  jsonLd,
  type Crumb,
} from "@/lib/schema";
import { shareMetadata, siteUrl, socialImage } from "@/lib/seo";
import { serviceByHref } from "@/lib/services";

/*
 * Allowed to block on navigation: every page here is prerendered from
 * generateStaticParams, so the wait is a cached fetch, and blocking keeps
 * the whole page in one piece (no placeholder while its content streams).
 * Without this, Next 16's instant-navigation check flags the params read.
 */
export const instant = false;

// Every post, drafts and the template included: proxy.ts answers 404 for
// drafts on the live site (unless the preview secret is sent) and for
// unknown slugs.
export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) return {};
  const title = `${post.title} | Bellops`;
  const path = postPath(post);
  const share = shareMetadata({ title, description: post.description, path });
  const image = postImage(post);
  const images = image ? [{ url: image, alt: post.title }] : [socialImage];
  return {
    title: { absolute: title },
    description: post.description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": blogPage.rss },
    },
    // Drafts are never indexed, wherever they can be opened.
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
    authors: [{ name: post.author }],
    keywords: post.tags,
    openGraph: {
      ...share.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
      images,
    },
    twitter: { ...share.twitter, images },
  };
}

/** A published post's <DraftNote>: nothing (drafts show it). */
function Hidden({}: { children: ReactNode }) {
  return null;
}

/** One post: who wrote it and when, its contents, the text, the way in. */
export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  const { default: Text } = await import(`@/content/blog/${post.slug}.mdx`);
  const hub = post.hub ? serviceByHref(post.hub) : undefined;
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
        published: post.date,
        updated: post.updated,
        author: post.author,
        byStudio: byStudio(post),
        image: `${siteUrl}${postImage(post) ?? socialImage.url}`,
        tags: post.tags,
        hubUrl: hub ? `${siteUrl}${hub.href}` : undefined,
      }),
      breadcrumbList(trail, path),
      ...(post.faq.length ? [faqPage(post.faq)] : []),
      ...(post.dataset
        ? [
            dataset({
              path,
              ...post.dataset,
              fileUrl: `${siteUrl}${post.dataset.file}`,
              encodingFormat: post.dataset.file.endsWith(".csv")
                ? "text/csv"
                : "application/octet-stream",
              published: post.date,
            }),
          ]
        : []),
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
            <span>{post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
            {post.draft && <span className="post-draft">Draft</span>}
          </p>
          {post.updated && (
            <p className="post-updated">
              Updated{" "}
              <time dateTime={post.updated}>
                {formatPostDate(post.updated)}
              </time>
            </p>
          )}
          {post.tags.length > 0 && (
            <ul className="post-tags" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </header>
        <div className="post-layout">
          <PostToc toc={post.toc} />
          <div className="post-body">
            <Text components={post.draft ? undefined : { DraftNote: Hidden }} />
          </div>
        </div>
      </article>
      {hub && (
        <section aria-labelledby="post-hub" className="wrap block">
          <div className="block-head">
            <h2 id="post-hub" className="block-title">
              The service behind this post
            </h2>
          </div>
          <ServiceRows items={[hub]} />
        </section>
      )}
      <ContactCta />
    </>
  );
}

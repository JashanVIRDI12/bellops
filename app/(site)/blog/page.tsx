import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { Crumbs, RevealTitle } from "@/components/site/RevealTitle";
import {
  formatPostDate,
  getAllPosts,
  getPublishedPosts,
  postPath,
} from "@/lib/blog";
import { blogPage, servicesPage, workPage } from "@/lib/content";
import {
  breadcrumbList,
  jsonLd,
  organizationId,
  type Crumb,
} from "@/lib/schema";
import { shareMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: blogPage.title },
  description: blogPage.description,
  alternates: {
    canonical: blogPage.path,
    types: { "application/rss+xml": blogPage.rss },
  },
  ...shareMetadata({
    title: blogPage.title,
    description: blogPage.description,
    path: blogPage.path,
  }),
};

const trail: Crumb[] = [{ label: "Home", href: "/" }, { label: "Blog" }];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      "@id": `${siteUrl}${blogPage.path}#blog`,
      url: `${siteUrl}${blogPage.path}`,
      name: blogPage.title,
      description: blogPage.description,
      inLanguage: "en-IN",
      publisher: { "@id": organizationId },
      blogPost: getPublishedPosts().map((post) => ({
        "@id": `${siteUrl}${postPath(post)}#article`,
      })),
    },
    breadcrumbList(trail, blogPage.path),
  ],
};

/** Published posts, newest first (drafts too, except on the live site). */
export default function Blog() {
  const posts = getAllPosts();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <section className="wrap case-intro">
        <Crumbs trail={trail} />
        <RevealTitle text={blogPage.heading} className="case-title" />
      </section>
      <section aria-label="Posts" className="wrap block">
        {posts.length === 0 ? (
          <>
            <p className="blog-soon">Coming soon</p>
            <p className="page-copy">
              In the meantime, see{" "}
              <Link href={workPage.path} className="text-link">
                our work
              </Link>{" "}
              or{" "}
              <Link href={servicesPage.path} className="text-link">
                what we do
              </Link>
              .
            </p>
          </>
        ) : (
          <ul className="post-list">
            {posts.map((post, index) => (
              <li key={post.slug}>
                <Link href={postPath(post)} className="post-card">
                  {post.ogImage && (
                    <span className="post-card-cover">
                      <Image
                        src={post.ogImage}
                        alt=""
                        fill
                        sizes="(min-width: 48rem) 22rem, calc(100vw - 2.5rem)"
                        // The first cover is usually the page's largest paint.
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : undefined}
                      />
                    </span>
                  )}
                  <span className="post-card-text">
                    <h2>{post.title}</h2>
                    <p>{post.description}</p>
                    <span className="post-meta">
                      <time dateTime={post.date}>
                        {formatPostDate(post.date)}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>{post.readingMinutes} min read</span>
                      {post.draft && <span className="post-draft">Draft</span>}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="post-tags">
                        {post.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ContactCta />
    </>
  );
}

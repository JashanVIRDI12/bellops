import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/site/ContactCta";
import { Crumbs, RevealTitle } from "@/components/site/RevealTitle";
import { blogPage, postPath, visiblePosts } from "@/lib/blog";
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
  alternates: { canonical: blogPage.path },
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
      publisher: { "@id": organizationId },
      blogPost: visiblePosts
        .filter((post) => !post.draft)
        .map((post) => ({ "@id": `${siteUrl}${postPath(post)}#article` })),
    },
    breadcrumbList(trail, blogPage.path),
  ],
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Every post, newest first. Live once the first post is published (proxy.ts). */
export default function Blog() {
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
        <ul className="post-list">
          {visiblePosts.map((post) => (
            <li key={post.slug}>
              <Link href={postPath(post)}>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <p className="post-meta">
                  <time dateTime={post.published}>
                    {dateFormat.format(new Date(post.published))}
                  </time>
                  {post.draft && <span className="post-draft">Draft</span>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ContactCta />
    </>
  );
}

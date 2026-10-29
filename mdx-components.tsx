import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { Callout, DraftNote } from "@/components/blog/Callout";
import { CsvDownloadLink } from "@/components/blog/CsvDownloadLink";
import { PostImage } from "@/components/blog/PostImage";
import { SortableRankingTable } from "@/components/blog/SortableRankingTable";

/**
 * How blog posts (content/blog/*.mdx) render. Styles come from .post-body.
 * Links to the site's pages use next/link; links to files (a .csv, a .pdf)
 * are plain links (a .csv also reports blog_csv_download to Google
 * Analytics, through CsvDownloadLink); links out open in a new tab, with
 * rel="noopener noreferrer". Heading levels and ids come from
 * lib/mdx/remark-post.mjs.
 */
function PostLink({
  href = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const isFile = /\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0] ?? "");
  if ((href.startsWith("/") && !isFile) || href.startsWith("#"))
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  if (href.startsWith("/") && /\.csv$/i.test(href.split(/[?#]/)[0] ?? ""))
    return <CsvDownloadLink href={href}>{children}</CsvDownloadLink>;
  if (href.startsWith("/"))
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const components: MDXComponents = {
  a: PostLink,
  table: (props) => (
    <div className="post-table">
      <table {...props} />
    </div>
  ),
  // Components a post can use (content/blog/how-to-add-a-post.mdx).
  Image: PostImage,
  Callout,
  DraftNote,
  CsvDownloadLink,
  SortableRankingTable,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

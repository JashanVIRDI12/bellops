import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * How blog posts (content/blog/*.mdx) render. Styles come from .post-body;
 * links inside the site use next/link, links out open in a new tab.
 */
function PostLink({
  href = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/") || href.startsWith("#"))
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
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
  // A post's title is its page's H1; headings in the text start at H2.
  h1: (props) => <h2 {...props} />,
  table: (props) => (
    <div className="post-table">
      <table {...props} />
    </div>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}

import type { ReactNode } from "react";

/** A boxed aside in a post: <Callout title="Lab caveat">…</Callout>. */
export function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="post-callout">
      {title && <p className="post-callout-title">{title}</p>}
      {children}
    </aside>
  );
}

/**
 * A note for reviewers: <DraftNote>…</DraftNote>. The post page shows it
 * only while the post is a draft (app/(site)/blog/[slug]/page.tsx), so it
 * can't reach the live post.
 */
export function DraftNote({ children }: { children: ReactNode }) {
  return (
    <aside className="post-callout" data-tone="draft">
      <p className="post-callout-title">Draft note</p>
      {children}
    </aside>
  );
}

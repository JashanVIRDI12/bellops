import type { TocEntry } from "@/lib/blog";

/**
 * A post's contents: its H2s, with their H3s nested. Plain links to the
 * headings' ids, so it works without JavaScript. On wide screens it sits
 * beside the text and stays in view; on phones it's a closed "Contents"
 * disclosure above the text.
 */
function Entries({ toc }: { toc: readonly TocEntry[] }) {
  const sections: { entry: TocEntry; children: TocEntry[] }[] = [];
  for (const entry of toc) {
    const last = sections.at(-1);
    if (entry.depth > 2 && last) last.children.push(entry);
    else sections.push({ entry, children: [] });
  }
  return (
    <ol className="post-toc-list">
      {sections.map(({ entry, children }) => (
        <li key={entry.id}>
          <a href={`#${entry.id}`}>{entry.text}</a>
          {children.length > 0 && (
            <ol>
              {children.map((child) => (
                <li key={child.id}>
                  <a href={`#${child.id}`}>{child.text}</a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}

export function PostToc({ toc }: { toc: readonly TocEntry[] }) {
  if (toc.length < 3) return null;
  return (
    <>
      <details className="post-toc post-toc-narrow">
        <summary>Contents</summary>
        <nav aria-label="Contents">
          <Entries toc={toc} />
        </nav>
      </details>
      <nav aria-labelledby="post-toc-title" className="post-toc post-toc-wide">
        <p id="post-toc-title" className="post-toc-title">
          Contents
        </p>
        <Entries toc={toc} />
      </nav>
    </>
  );
}
